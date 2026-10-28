import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api } from "./client";
import { useStore } from "./store";
export function useResource<T>(path: string | null, { auth = true } = {}) {
  const { user } = useStore();
  const identity = auth ? (user?._id ?? "guest") : "public";
  const [state, set] = useState<{
    data?: T;
    loading: boolean;
    error: string;
    path?: string;
    revision?: number;
    identity?: string;
  }>({ loading: true, error: "" });
  const [revision, bump] = useState(0);
  useFocusEffect(
    useCallback(() => {
      if (!path) return;
      const controller = new AbortController();
      api<T>(path, { signal: controller.signal, auth })
        .then((data) => {
          if (!controller.signal.aborted)
            set({ data, loading: false, error: "", path, revision, identity });
        })
        .catch((error) => {
          if (!controller.signal.aborted)
            set({
              loading: false,
              error: error instanceof Error ? error.message : "Không tải được dữ liệu. Vui lòng thử lại.",
              path,
              revision,
              identity,
            });
        });
      return () => controller.abort();
    }, [path, revision, identity, auth]),
  );
  const current =
    state.path === path &&
    state.revision === revision &&
    state.identity === identity;
  return {
    data: current ? state.data : undefined,
    loading: Boolean(path) && (!current || state.loading),
    error: current ? state.error : "",
    reload: useCallback(() => {
      bump((n) => n + 1);
    }, []),
  };
}
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Thao tác chưa thành công.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, error, run, setError };
}
