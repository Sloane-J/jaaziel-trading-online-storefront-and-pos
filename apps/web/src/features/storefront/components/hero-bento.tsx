import { Link } from "react-router";
import { ImageCarousel } from "@/features/storefront/components/image-carousel";
import { useStorefrontHome } from "@/features/storefront/hooks/use-storefront";
import { formatPrice } from "@/lib/format-price";

const HERO_HEIGHT = "h-80 md:h-96";

export function HeroBento() {
  const { data: home, isLoading, isError } = useStorefrontHome();
  const data = home?.hero;

  if (isLoading) {
    return (
      <div className={`mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 py-8 md:grid-cols-3`}>
        <div className={`col-span-1 animate-pulse rounded-3xl bg-muted md:col-span-2 ${HERO_HEIGHT}`} />
        <div className={`col-span-1 animate-pulse rounded-3xl bg-muted ${HERO_HEIGHT}`} />
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const { primary, secondary } = data;

  return (
    <div className="mx-auto grid grid-cols-1 gap-4 max-w-7xl px-6 py-8 md:grid-cols-3">
      {/* Primary bento — wide, frosted glass panel + prev/next controls */}
      {primary?.product ? (
        <Link
          to={`/products/${primary.product.id}`}
          className={`group relative overflow-hidden rounded-3xl bg-accent md:col-span-2 ${HERO_HEIGHT}`}
        >
          <ImageCarousel
            images={primary.product.images}
            alt={primary.product.name}
            showControls
          />
          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-2xl border border-white/50 bg-neutral-200/60 p-4 shadow-lg backdrop-blur-lg">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/70">
                {primary.category.name}
              </p>
              <p className="font-heading text-lg font-semibold text-foreground">
                {primary.product.name}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-foreground">
              {formatPrice(primary.product.price)}
            </p>
          </div>
        </Link>
      ) : (
        <div className={`flex items-center justify-center rounded-3xl bg-accent text-sm text-muted-foreground md:col-span-2 ${HERO_HEIGHT}`}>
          {primary ? `No products yet in ${primary.category.name}` : "Featured category not set"}
        </div>
      )}

      {/* Secondary bento — square, carousel only, pill-shaped price */}
      {secondary?.product ? (
        <Link
          to={`/products/${secondary.product.id}`}
          className={`group relative overflow-hidden rounded-3xl bg-accent md:col-span-1 ${HERO_HEIGHT}`}
        >
          <ImageCarousel images={secondary.product.images} alt={secondary.product.name} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
            <p className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-foreground shadow-sm">
              {secondary.product.name}
            </p>
            <p className="rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
              {formatPrice(secondary.product.price)}
            </p>
          </div>
        </Link>
      ) : (
        <div className={`flex items-center justify-center rounded-3xl bg-accent text-sm text-muted-foreground md:col-span-1 ${HERO_HEIGHT}`}>
          {secondary ? `No products yet in ${secondary.category.name}` : "Featured category not set"}
        </div>
      )}
    </div>
  );
}