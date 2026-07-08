import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { sessionMiddleware } from "./middleware/session";
import categoriesRoutes from "./routes/categories";
import uploadsRoutes from "./routes/uploads";
import type { Variables } from "./types/context";

const app = new Hono<{ Variables: Variables }>();

app.use("*", cors({ origin: "http://localhost:5173", credentials: true }));

app.use("*", sessionMiddleware); // runs on every request, populates context

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/categories", categoriesRoutes);
app.route("/uploads", uploadsRoutes);

export default app;
