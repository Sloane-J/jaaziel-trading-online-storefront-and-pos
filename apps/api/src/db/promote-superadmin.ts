import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { user } from "./schema";

async function promote() {
  const [updated] = await db
    .update(user)
    .set({
      role: "superadmin",
      tenantId: "aba231b8-c078-441f-8820-1fc6d592766b",
    })
    .where(eq(user.id, "SSSOlkEZsaSVztgTiXKqkOmgXE59t3ER"))
    .returning();

  console.log("Promoted user:", updated);
}

promote().catch((err) => {
  console.error(err);
  process.exit(1);
});