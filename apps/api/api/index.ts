import { handle } from "hono/vercel";
import app from "../dist/index";

export const runtime = "nodejs";

export default handle(app);