import { ArrowRightIcon } from "lucide-react";
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
            <div
              key={i}
              className="size-40 shrink-0 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!previews || previews.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Shop by Category
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            From everyday essentials to standout finds — browse our full
            range, organized just for you.
          </p>
        </div>
        <Link
          to="/search"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary sm:flex"
        >
          Browse everything
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {previews.map(({ category, product }) => (
          <Link
            key={category.id}
            to={`/shop/${category.slug}`}
            className="group flex shrink-0 flex-col items-center gap-3"
          >
            <div className="relative size-32 overflow-hidden rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-background transition-all duration-300 group-hover:scale-105 group-hover:ring-primary md:size-40">
              {product?.images[0] ? (
                <img
                  src={getImageUrl(product.images[0], { width: 200 })}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted text-xs text-muted-foreground">
                  No image
                </div>
              )}

              {/* Hover reveal: darkens the image and surfaces the category
                  name centered over it, on top of the always-visible
                  caption below for touch devices with no hover state. */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100">
                <span className="px-3 text-center text-sm font-semibold text-white">
                  {category.name}
                </span>
              </div>
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