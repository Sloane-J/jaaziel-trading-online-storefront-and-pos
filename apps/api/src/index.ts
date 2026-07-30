import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { sessionMiddleware } from "./middleware/session";
import cartRoutes from "./routes/cart";
import categoriesRoutes from "./routes/categories";
import checkoutRoutes from "./routes/checkout";
import ordersRoutes from "./routes/orders";
import posRoutes from "./routes/pos";
import productsRoutes from "./routes/products";
import reportsRoutes from "./routes/reports";
import sitemapRoutes from "./routes/sitemap";
import storefrontRoutes from "./routes/storefront";
import uploadsRoutes from "./routes/uploads";
import type { Variables } from "./types/context";

const app = new Hono<{ Variables: Variables }>();

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://jaaziel-trading-online-storefront-a.vercel.app",
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
// ...
app.route("/checkout", checkoutRoutes);

export default app;
