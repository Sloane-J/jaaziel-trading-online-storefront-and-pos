import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, } from "react";
import { useNextOrderNumber } from "@/features/pos/hooks/use-pos";
import type { Product } from "@/lib/api/products";

export type PosCartItem = {
  product: Product;
  quantity: number;
};

function formatOrderNumber(n: number): string {
  return `#${String(n).padStart(4, "0")}`;
}

export function usePosCart() {
  const [items, setItems] = useState<PosCartItem[]>([]);
  const { data: nextOrderNumber } = useNextOrderNumber();
  const queryClient = useQueryClient();

  const orderNumber = formatOrderNumber(nextOrderNumber ?? 1);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
      );
    });
  }, []);

  const deleteItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearSale = useCallback(() => {
    setItems([]);
    // Refetch the real count from the backend so the next order number reflects
    // the sale that was just completed (or simply resets after a manual clear).
    queryClient.invalidateQueries({ queryKey: ["pos", "next-order-number"] });
  }, [queryClient]);

  const quantityOf = useCallback(
    (productId: string) => items.find((item) => item.product.id === productId)?.quantity ?? 0,
    [items],
  );

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return { items, orderNumber, addItem, removeItem, deleteItem, clearSale, quantityOf, subtotal };
}