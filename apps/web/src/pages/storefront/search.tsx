import { useSearchParams } from "react-router";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { ProductCard } from "@/features/storefront/components/product-card";
import { useProductSearch } from "@/features/storefront/hooks/use-storefront";
import { useDocumentTitle } from "@/lib/use-document-title";

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  useDocumentTitle(query ? `Search: ${query}` : "Search");

  const { data: results, isLoading, isError } = useProductSearch(query);

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-[1600px] px-6 py-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Search results
          </h1>
          <p className="mt-1 text-muted-foreground">
            {query ? (
              <>
                Showing results for <span className="font-medium text-foreground">"{query}"</span>
              </>
            ) : (
              "Enter a search term to find products."
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-flow-col auto-cols-[42%] items-start gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 sm:items-stretch sm:overflow-visible sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [&::-webkit-scrollbar]:hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <p role="alert" className="text-destructive">
            Couldn't load search results.
          </p>
        ) : !query ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">Use the search bar above to find products.</p>
          </div>
        ) : results && results.length > 0 ? (
          <div className="grid grid-flow-col auto-cols-[42%] items-start gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 sm:items-stretch sm:overflow-visible sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 [&::-webkit-scrollbar]:hidden">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">
              No products found for "{query}". Try a different search term.
            </p>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}