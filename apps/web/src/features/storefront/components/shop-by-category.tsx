import { Link } from "react-router";
import { useCategoriesPreview } from "@/features/storefront/hooks/use-storefront";
import { getImageUrl } from "@/lib/get-image-url";

export function ShopByCategory() {
  const { data: previews, isLoading } = useCategoriesPreview();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1600px] px-6 py-10">
        <div className="mb-4 h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="size-40 shrink-0 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  if (!previews || previews.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-6 py-10">
      <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
        Shop by category
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {previews.map(({ category, product }) => (
          <Link
            key={category.id}
            to={`/shop/${category.slug}`}
            className="group flex shrink-0 flex-col items-center gap-3"
          >
            <div className="size-32 overflow-hidden rounded-full border border-border bg-muted transition-transform duration-300 group-hover:scale-105 md:size-40">
              {product?.images[0] ? (
                <img
                  src={getImageUrl(product.images[0], { width: 200 })}
                  alt={category.name}
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <p className="max-w-[8rem] truncate text-sm font-medium text-foreground">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}