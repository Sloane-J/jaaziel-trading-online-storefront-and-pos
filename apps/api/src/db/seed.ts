import "dotenv/config";
import { db } from "./client";
import { tenants } from "./schema";

async function seed() {
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: "Jaaziel Trading Enterprise",
      slug: "jaaziel-trading-enterprise",
    })
    .returning();

  console.log("Tenant created:", tenant);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});