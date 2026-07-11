import { integer, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { carts } from "./carts";
import { products } from "./products";

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [
    // One row per product per cart — adding the same product again increments
    // quantity on the existing row instead of creating a duplicate.
    uniqueIndex("cart_items_cart_id_product_id_idx").on(table.cartId, table.productId),
  ],
);
