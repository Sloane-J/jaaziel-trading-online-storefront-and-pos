import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Jazel Trading Enterprise API"));

export default app;