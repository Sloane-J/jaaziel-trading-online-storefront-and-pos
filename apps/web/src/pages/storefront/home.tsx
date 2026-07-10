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

  const excludedProductIds = new Set(
    [
      home?.hero.primary?.product?.id,
      home?.hero.secondary?.product?.id,
      ...(home?.spotlight.map((s) => s.product?.id) ?? []),
    ].filter(Boolean),
  );

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

      {categories?.map((category) => {
        const productsInCategory = (allProducts ?? []).filter(
          (p) => p.categoryId === category.id && !excludedProductIds.has(p.id),
        );

        return (
          <CategorySection
            key={category.id}
            category={category}
            products={productsInCategory}
          />
        );
      })}
    </StorefrontLayout>
  );
}
