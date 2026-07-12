import { createContext, type ReactNode, useContext } from "react";
import { type PosCartItem, usePosCart } from "@/features/pos/hooks/use-pos-cart";

type PosSaleContextValue = {
  items: PosCartItem[];
  orderNumber: string;
  addItem: (product: PosCartItem["product"]) => void;
  removeItem: (productId: string) => void;
  deleteItem: (productId: string) => void;
  clearSale: () => void;
  quantityOf: (productId: string) => number;
  subtotal: number;
};

const PosSaleContext = createContext<PosSaleContextValue | null>(null);

export function PosSaleProvider({ children }: { children: ReactNode }) {
  const cart = usePosCart();
  return <PosSaleContext.Provider value={cart}>{children}</PosSaleContext.Provider>;
}

export function usePosSale() {
  const ctx = useContext(PosSaleContext);
  if (!ctx) throw new Error("usePosSale must be used within a PosSaleProvider");
  return ctx;
}