import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client";
import { products } from "../db/schema/products";
import { categories } from "../db/schema/categories";
import type { Variables } from "../types/context";

const sitemapRoutes = new Hono<{ Variables: Variables }>();

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID;
const SITE_URL = process.env.SITE_URL ?? "https://jaazieltrading.com";

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// GET /sitemap.xml — public. Lists all public storefront URLs for search engines.
sitemapRoutes.get("/sitemap.xml", async (c) => {
  if (!DEFAULT_TENANT_ID) {
    return c.text("Server misconfigured", 500);
  }

  const [activeCategories, activeProducts] = await Promise.all([
    db
      .select({ slug: categories.slug, updatedAt: categories.updatedAt })
      .from(categories)
      .where(and(eq(categories.tenantId, DEFAULT_TENANT_ID), eq(categories.isActive, true))),
    db
      .select({ id: products.id, updatedAt: products.updatedAt })
      .from(products)
      .where(and(eq(products.tenantId, DEFAULT_TENANT_ID), eq(products.isActive, true))),
  ]);

  const staticUrls = [
    { loc: "/", priority: "1.0" },
    { loc: "/contact", priority: "0.5" },
  ];

  const categoryUrls = activeCategories.map((cat) => ({
    loc: `/shop/${cat.slug}`,
    priority: "0.8",
    lastmod: new Date(cat.updatedAt).toISOString().slice(0, 10),
  }));

  const productUrls = activeProducts.map((product) => ({
    loc: `/products/${product.id}`,
    priority: "0.7",
    lastmod: new Date(product.updatedAt).toISOString().slice(0, 10),
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${xmlEscape(SITE_URL + url.loc)}</loc>
    ${"lastmod" in url ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return c.text(xml, 200, { "Content-Type": "application/xml" });
});

export default sitemapRoutes;