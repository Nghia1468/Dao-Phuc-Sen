"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product, ProductVariant } from "./data";

export interface CartItem {
  /** id duy nhất trong giỏ = mã sản phẩm + loại cán (để 1 dao có thể nằm 2 dòng: cán sắt / cán gỗ). */
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
  /** Nhãn biến thể đã chọn, ví dụ "Cán Sắt" / "Cán Gỗ" — để trống nếu sản phẩm không có biến thể. */
  variantLabel?: string;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalQuantity: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "mai_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // load from localStorage once on mount (client only)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — cart just won't persist
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (product: Product, quantity = 1, variant?: ProductVariant) => {
      // Nếu sản phẩm có biến thể nhưng không truyền vào, mặc định lấy biến thể rẻ nhất
      // (thường là Cán Sắt) — để ProductCard/QuickView "thêm nhanh" vẫn hoạt động đúng.
      const chosen =
        variant ?? (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
      const lineId = chosen ? `${product.id}__${chosen.handleType}` : product.id;
      const price = chosen ? chosen.salePrice ?? chosen.price : product.salePrice ?? product.price;

      setItems((prev) => {
        const existing = prev.find((i) => i.id === lineId);
        if (existing) {
          return prev.map((i) =>
            i.id === lineId ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [
          ...prev,
          {
            id: lineId,
            productId: product.id,
            name: product.name,
            image: product.images[0],
            price,
            quantity,
            category: product.category,
            variantLabel: chosen?.label,
          },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const totalQuantity = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng bên trong <CartProvider>");
  return ctx;
}
