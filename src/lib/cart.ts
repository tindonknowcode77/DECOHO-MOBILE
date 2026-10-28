import type { Product } from "./types";

export type CartItem = { product: Product; quantity: number };

// Local storage can contain old or partially written data.
export function parseCart(raw: string | null): CartItem[] {
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is CartItem =>
      Boolean(item && typeof item.product?._id === "string" &&
        Number.isInteger(item.quantity) && item.quantity > 0),
    );
  } catch {
    return [];
  }
}
