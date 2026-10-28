import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "https://decoho-be.onrender.com/api"
)
  .trim()
  .replace(/\/+$/, "");
type Tokens = { accessToken: string; refreshToken: string };
let tokens: Tokens | null = null;
let revision = 0;
let refreshJob: Promise<void> | null = null;
let expired: () => void = () => {};
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
const key = "decoho.session.v1";
export function onSessionExpired(callback: () => void) {
  expired = callback;
  return () => {
    expired = () => {};
  };
}
export const hasSession = () => Boolean(tokens);
export async function saveTokens(value: Tokens | null) {
  revision += 1;
  tokens = value;
  if (Platform.OS === "web") {
    if (typeof sessionStorage !== "undefined") {
      if (value) sessionStorage.setItem(key, JSON.stringify(value));
      else sessionStorage.removeItem(key);
    }
  } else if (value) await SecureStore.setItemAsync(key, JSON.stringify(value));
  else await SecureStore.deleteItemAsync(key);
}
export async function restoreTokens() {
  const raw =
    Platform.OS === "web"
      ? typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem(key)
        : null
      : await SecureStore.getItemAsync(key);
  if (raw) {
    try {
      const value = JSON.parse(raw);
      if (
        typeof value.accessToken === "string" &&
        typeof value.refreshToken === "string"
      )
        tokens = value;
    } catch {
      await saveTokens(null);
    }
  }
  return Boolean(tokens);
}
type Options = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  auth?: boolean;
  timeout?: number;
};
async function send(
  path: string,
  options: Options,
  bearer?: string,
): Promise<Response> {
  if (!/^https?:\/\//.test(API_URL))
    throw new Error("Chưa cấu hình địa chỉ máy chủ.");
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort);
  if (options.signal?.aborted) abort();
  const timer = setTimeout(abort, options.timeout ?? 20000);
  const form = options.body instanceof FormData;
  try {
    return await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...(options.body && !form
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body:
        options.body === undefined
          ? undefined
          : form
            ? (options.body as FormData)
            : JSON.stringify(options.body),
    });
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error(
        "Kết nối đã bị hủy hoặc hết thời gian chờ. Vui lòng thử lại.",
      );
    if (error instanceof TypeError)
      throw new Error("Chưa kết nối được DECOHO. Kiểm tra mạng và thử lại.");
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}
async function read<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      Array.isArray(body?.message)
        ? body.message.join("\n")
        : (body?.message ?? `Yêu cầu thất bại (${response.status}).`),
      response.status,
    );
  return body as T;
}
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const auth = options.auth ?? true;
  let response = await send(
    path,
    options,
    auth ? tokens?.accessToken : undefined,
  );
  if (response.status === 401 && auth && tokens?.refreshToken) {
    if (!refreshJob) {
      const current = revision;
      const refreshToken = tokens.refreshToken;
      refreshJob = send("/auth/refresh", { method: "POST" }, refreshToken)
        .then(read<Tokens>)
        .then(async (value) => {
          if (revision === current) await saveTokens(value);
        })
        .catch(async (error) => {
          if (
            error instanceof ApiError &&
            error.status === 401 &&
            revision === current
          ) {
            await saveTokens(null);
            expired();
          }
          throw error;
        })
        .finally(() => {
          refreshJob = null;
        });
    }
    await refreshJob;
    if (!tokens) throw new ApiError("Phiên đăng nhập đã hết hạn.", 401);
    response = await send(path, options, tokens.accessToken);
  }
  return read<T>(response);
}
export const list = <T>(value: T[] | { items: T[] }): T[] =>
  Array.isArray(value) ? value : value.items;
