import { pgTable, uuid, integer } from "drizzle-orm/pg-core";
import { carts } from "./carts";
import { products } from "./products";

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id").notNull().references(() => carts.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
});