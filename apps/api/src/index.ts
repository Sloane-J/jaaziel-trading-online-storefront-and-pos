import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { sessionMiddleware } from "./middleware/session";
import activityLogsRoutes from "./routes/activity-logs";
import cartRoutes from "./routes/cart";
import categoriesRoutes from "./routes/categories";
import checkoutRoutes from "./routes/checkout";
import ordersRoutes from "./routes/orders";
import paystackWebhookRoutes from "./routes/paystack-webhook";
import posRoutes from "./routes/pos";
import productsRoutes from "./routes/products";
import reportsRoutes from "./routes/reports";
import sitemapRoutes from "./routes/sitemap";
import staffRoutes from "./routes/staff";
import storefrontRoutes from "./routes/storefront";
import dataIntegrityRoutes from "./routes/superadmin-data-integrity";
import superadminOrdersRoutes from "./routes/superadmin-orders";
import uploadsRoutes from "./routes/uploads";
import type { Variables } from "./types/context";

const app = new Hono<{ Variables: Variables }>();

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://jaaziel-trading.vercel.app",
    ],
    credentials: true,
  }),
);
app.use("*", sessionMiddleware); // runs on every request, populates context

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/categories", categoriesRoutes);
app.route("/uploads", uploadsRoutes);
app.route("/products", productsRoutes);
app.route("/storefront", storefrontRoutes);
app.route("/cart", cartRoutes);
app.route("/pos", posRoutes);
app.route("/orders", ordersRoutes);
app.route("/reports", reportsRoutes);
app.route("/", sitemapRoutes);
app.route("/checkout", checkoutRoutes);
app.route("/paystack", paystackWebhookRoutes);
app.route("/staff", staffRoutes);
app.route("/activity-logs", activityLogsRoutes);
app.route("/superadmin/orders", superadminOrdersRoutes);
app.route("/superadmin/data-integrity", dataIntegrityRoutes);

export default app;