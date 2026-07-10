import { useParams, Link } from "react-router";
import { ShoppingBagIcon } from "lucide-react";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/features/storefront/components/product-gallery";
import { ProductCard } from "@/features/storefront/components/product-card";
import {
  usePublicProduct,
  usePublicCategories,
  usePublicProducts,
} from "@/features/storefront/hooks/use-storefront";

function formatPrice(price: string): string {
  return `GHS ${Number(price).toFixed(2)}`;
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = usePublicProduct(id ?? "");
  const { data: categories } = usePublicCategories();
  const { data: relatedProducts } = usePublicProducts(product?.categoryId);

  const category = categories?.find((c) => c.id === product?.categoryId);
  const attributesEntries = product ? Object.entries(product.attributes) : [];
  const isOutOfStock = product?.stock === 0;

  const otherProducts = (relatedProducts ?? []).filter((p) => p.id !== product?.id).slice(0, 5);

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (isError || !product) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-24 text-center">
          <p className="text-lg font-medium text-foreground">Product not found</p>
          <p className="mt-2 text-muted-foreground">
            This product may have been removed or is no longer available.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
          >
            Back to shop
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {category && (
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
            <Link to={`/shop/${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <ProductGallery images={product.images} alt={product.name} />

          <div className="space-y-5">
            {category && (
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {category.name}
              </p>
            )}

            <h1 className="font-heading text-3xl font-semibold text-foreground">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <p className="text-2xl font-semibold text-foreground">
                {formatPrice(product.price)}
              </p>
              {isOutOfStock ? (
                <span className="text-sm font-medium text-destructive">Out of stock</span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {product.stock} in stock
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {attributesEntries.length > 0 && (
              <dl className="space-y-2 border-t border-border pt-4">
                {attributesEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <Button
              size="lg"
              disabled={isOutOfStock}
              className="w-full gap-2 transition-transform active:scale-[0.98]"
            >
              <ShoppingBagIcon className="size-4" />
              {isOutOfStock ? "Out of stock" : "Add to cart"}
            </Button>
          </div>
        </div>

        {otherProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
              You might also like
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {otherProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </StorefrontLayout>
  );
}