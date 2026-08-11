import { pgTable, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const deliveryZones = pgTable("delivery_zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id),
  // Normalized area/town name used as the cache key (e.g. "madina", lowercased, trimmed).
  areaKey: text("area_key").notNull(),
  distanceKm: numeric("distance_km", { precision: 6, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});