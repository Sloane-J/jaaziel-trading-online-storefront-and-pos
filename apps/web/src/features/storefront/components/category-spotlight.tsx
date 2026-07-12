import { Link } from "react-router";
import type { SpotlightItem } from "@/lib/api/storefront";
import { formatPrice } from "@/lib/format-price";

function SpotlightCard({ item }: { item: SpotlightItem }) {
  const { category, product } = item;

  if (!product) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        No products yet in {category.name}
      </div>
    );
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden border-b border-border bg-muted">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </div>
      <div className="space-y-1 p-4">
        <p className="truncate font-heading text-base font-semibold text-foreground">
          {product.name}
        </p>
        <p className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

type CategorySpotlightSectionProps = {
  items: SpotlightItem[];
};

export function CategorySpotlightSection({ items }: CategorySpotlightSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-center">
      <div className="max-w-sm space-y-4">
        <h2 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
          Our top picks, handpicked for you
        </h2>
        <p className="text-muted-foreground">
          A closer look at what's new across our favorite categories, chosen to help you find
          something you'll love.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <SpotlightCard key={item.category.id} item={item} />
        ))}
      </div>
    </section>
  );
}