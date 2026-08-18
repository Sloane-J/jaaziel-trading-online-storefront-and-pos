import { useMemo } from "react";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { BannerCarousel } from "@/features/storefront/components/banner-carousel";
import { CategorySection } from "@/features/storefront/components/category-section";
import { CategorySpotlightSection } from "@/features/storefront/components/category-spotlight";
import { HeroBento } from "@/features/storefront/components/hero-bento";
import { ShopByCategory } from "@/features/storefront/components/shop-by-category";
import {
  usePublicCategories,
  usePublicProducts,
  useStorefrontHome,
} from "@/features/storefront/hooks/use-storefront";

export function StorefrontHomePage() {
  const { data: home } = useStorefrontHome();
  const { data: categories } = usePublicCategories();
  const { data: allProducts } = usePublicProducts();

  const excludedProductIds = useMemo(() => {
    return new Set(
      [
        home?.hero.primary?.product?.id,
        home?.hero.secondary?.product?.id,
        ...(home?.spotlight.map((s) => s.product?.id) ?? []),
      ].filter((id): id is string => Boolean(id)),
    );
  }, [home]);

  // Group products by category once, rather than re-filtering the full
  // product list for every category section on each render.
  const productsByCategory = useMemo(() => {
    const map = new Map<string, typeof allProducts>();
    for (const product of allProducts ?? []) {
      if (excludedProductIds.has(product.id)) continue;
      const existing = map.get(product.categoryId) ?? [];
      existing.push(product);
      map.set(product.categoryId, existing);
    }
    return map;
  }, [allProducts, excludedProductIds]);

  return (
    <StorefrontLayout>
      {home?.topBannerImages && home.topBannerImages.length > 0 && (
        <div className="pt-6">
          <BannerCarousel images={home.topBannerImages} />
        </div>
      )}
      <HeroBento />
      <ShopByCategory />
      {home?.spotlight && <CategorySpotlightSection items={home.spotlight} />}
      {home?.secondBannerImages && home.secondBannerImages.length > 0 && (
        <div className="py-6">
          <BannerCarousel images={home.secondBannerImages} />
        </div>
      )}
      {categories?.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          products={productsByCategory.get(category.id) ?? []}
        />
      ))}
      {!categories && (
        <div className="mx-auto max-w-[1600px] px-6 py-8">
          <div className="mb-4 h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        </div>
      )}
      {categories && categories.length === 0 && (
        <div className="mx-auto max-w-[1600px] px-6 py-16 text-center text-muted-foreground">
          Products are coming soon — check back shortly.
        </div>
      )}
    </StorefrontLayout>
  );
}