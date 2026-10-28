import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from "expo-router";
import {
  api,
  ApiError,
  onSessionExpired,
  restoreTokens,
  saveTokens,
} from "./client";
import type { Product, User } from "./types";
import { parseCart, type CartItem } from "./cart";

type Store = {
  user: User | null;
  ready: boolean;
  sessionError: string;
  cart: CartItem[];
  cartReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requireLogin: () => boolean;
  add: (product: Product) => void;
  quantity: (id: string, n: number) => void;
  clear: () => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [basket, setBasket] = useState<{ key: string; items: CartItem[] }>({
    key: "",
    items: [],
  });
  const cartKey = `decoho.cart.${user?._id ?? "guest"}`;
  const cartReady = basket.key === cartKey;
  const cart = cartReady ? basket.items : [];
  const writes = useRef(Promise.resolve());
  useEffect(
    () =>
      onSessionExpired(() => {
        setUser(null);
        setSessionError("Phiên đăng nhập đã hết hạn.");
      }),
    [],
  );
  useEffect(() => {
    let active = true;
    restoreTokens()
      .then(async (exists) => {
        if (exists) {
          const profile = await api<User>("/users/me");
          if (active) setUser(profile);
        }
      })
      .catch(async (error) => {
        if (error instanceof ApiError && error.status === 401)
          await saveTokens(null);
        if (active) setSessionError(error.message);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(cartKey)
      .then((raw) => {
        const items = parseCart(raw);
        if (active) setBasket({ key: cartKey, items });
      })
      .catch(() => {
        if (active) setBasket({ key: cartKey, items: [] });
      });
    return () => {
      active = false;
    };
  }, [cartKey]);
  useEffect(() => {
    if (!basket.key) return;
    writes.current = writes.current
      .then(() =>
        AsyncStorage.setItem(basket.key, JSON.stringify(basket.items)),
      )
      .catch(() => {
        setSessionError("Không lưu được giỏ hàng trên thiết bị.");
      });
  }, [basket]);
  async function refreshUser() {
    setUser(await api<User>("/users/me"));
  }
  async function login(email: string, password: string) {
    const tokens = await api<{ accessToken: string; refreshToken: string }>(
      "/auth/login",
      { method: "POST", body: { email, password }, auth: false },
    );
    await finishLogin(tokens);
  }
  async function googleLogin(credential: string) {
    const tokens = await api<{ accessToken: string; refreshToken: string }>(
      "/auth/google",
      { method: "POST", body: { credential }, auth: false },
    );
    await finishLogin(tokens);
  }
  async function finishLogin(tokens: {
    accessToken: string;
    refreshToken: string;
  }) {
    await saveTokens(tokens);
    try {
      const profile = await api<User>("/users/me");
      await writes.current;
      const userKey = `decoho.cart.${profile._id}`;
      const raw = await AsyncStorage.getItem(userKey);
      const saved = parseCart(raw);
      const merged = new Map(
        saved
          .filter((x) => x.product?._id && x.quantity > 0)
          .map((x) => [x.product._id, x]),
      );
      if (basket.key === "decoho.cart.guest")
        for (const item of basket.items) {
          const existing = merged.get(item.product._id);
          merged.set(item.product._id, {
            product: item.product,
            quantity: Math.min(
              (existing?.quantity ?? 0) + item.quantity,
              item.product.stock ?? 99,
            ),
          });
        }
      await AsyncStorage.setItem(userKey, JSON.stringify([...merged.values()].filter((item) => item.quantity > 0)));
      await AsyncStorage.removeItem("decoho.cart.guest");
      setUser(profile);
      setSessionError("");
    } catch (error) {
      await saveTokens(null);
      throw error;
    }
  }
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      await saveTokens(null);
      setUser(null);
    }
  }
  const requireLogin = () => {
    if (user) return true;
    router.push({ pathname: "/auth/login", params: { returnTo: pathname } });
    return false;
  };
  const quantity = (id: string, n: number) =>
    setBasket((old) =>
      old.key !== cartKey
        ? old
        : {
            ...old,
            items: old.items
              .map((x) =>
                x.product._id === id
                  ? {
                      ...x,
                      quantity: Math.max(0, Math.min(n, x.product.stock ?? 99)),
                    }
                  : x,
              )
              .filter((x) => x.quantity > 0),
          },
    );
  const add = (product: Product) => {
    if (!ready) throw new Error("Đang khôi phục tài khoản. Vui lòng thử lại.");
    if (product.stock === 0 || product.status === "OUT_OF_STOCK")
      throw new Error("Sản phẩm đang hết hàng.");
    if (!cartReady)
      throw new Error("Giỏ hàng đang được tải. Vui lòng thử lại.");
    setBasket((old) => {
      if (old.key !== cartKey) return old;
      const exists = old.items.find((x) => x.product._id === product._id);
      return {
        ...old,
        items: exists
          ? old.items.map((x) =>
              x.product._id === product._id
                ? {
                    product,
                    quantity: Math.min(x.quantity + 1, product.stock ?? 99),
                  }
                : x,
            )
          : [...old.items, { product, quantity: 1 }],
      };
    });
  };
  return (
    <Context.Provider
      value={{
        user,
        ready,
        sessionError,
        cart,
        cartReady,
        login,
        googleLogin,
        logout,
        refreshUser,
        requireLogin,
        add,
        quantity,
        clear: () => setBasket({ key: cartKey, items: [] }),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("StoreProvider missing");
  return value;
}
