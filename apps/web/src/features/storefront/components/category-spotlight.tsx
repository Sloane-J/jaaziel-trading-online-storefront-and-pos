import { ArrowRightIcon, PackageIcon } from "lucide-react";
import { Link } from "react-router";
import type { SpotlightItem } from "@/lib/api/storefront";
import { formatPrice } from "@/lib/format-price";
import { getImageUrl } from "@/lib/get-image-url";

function SpotlightCard({ item }: { item: SpotlightItem }) {
  const { category, product } = item;

  if (!product) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/40 text-center">
        <PackageIcon className="size-6 text-muted-foreground" />
        <p className="px-4 text-sm text-muted-foreground">
          No products yet in {category.name}
        </p>
      </div>
    );
  }

  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-card transition-shadow group-hover:shadow-lg">
        {product.images[0] ? (
          <img
            src={getImageUrl(product.images[0], { width: 500 })}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          {category.name}
        </span>
      </div>
      <div className="space-y-1 pt-3">
        <p className="line-clamp-2 text-sm text-foreground">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Shop now
            <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

type CategorySpotlightSectionProps = {
  items: SpotlightItem[];
};

export function CategorySpotlightSection({
  items,
}: CategorySpotlightSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-center">
      <div className="max-w-sm space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Curated for you
        </p>
        <h2 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
          Our top picks, handpicked for you
        </h2>
        <p className="text-muted-foreground">
          A closer look at what's new across our favorite categories, chosen
          to help you find something you'll love.
        </p>
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          Browse everything
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <SpotlightCard key={item.category.id} item={item} />
        ))}
      </div>
    </section>
  );
}