import { handle } from "hono/vercel";
// @ts-expect-error - dist/index.js has no type declarations, but the JS output is correct
import app from "../dist/index.js";

export const runtime = "nodejs";

export default handle(app);
