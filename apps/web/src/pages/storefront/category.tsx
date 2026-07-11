import { useParams, Link } from "react-router";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { ProductCard } from "@/features/storefront/components/product-card";
import { useCategoryBySlug, usePublicProducts } from "@/features/storefront/hooks/use-storefront";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading, isError: categoryError } =
    useCategoryBySlug(slug ?? "");
  const { data: products, isLoading: productsLoading } = usePublicProducts(category?.id);

  if (categoryLoading) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-12">
          <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="grid grid-flow-col auto-cols-[42%] items-start gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 sm:items-stretch sm:overflow-visible sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (categoryError || !category) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-24 text-center">
          <p className="text-lg font-medium text-foreground">Category not found</p>
          <p className="mt-2 text-muted-foreground">
            This category may have been removed or renamed.
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
      <div className="mx-auto max-w-[1600px] px-6 py-12">
        <div className="mb-8 max-w-xl space-y-2">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>

        {productsLoading ? (
          <div className="grid grid-flow-col auto-cols-[42%] items-start gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 sm:items-stretch sm:overflow-visible sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-flow-col auto-cols-[42%] items-start gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 sm:items-stretch sm:overflow-visible sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [&::-webkit-scrollbar]:hidden">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No products in this category yet.</p>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}