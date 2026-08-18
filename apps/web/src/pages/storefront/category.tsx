import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import type { Product } from "@/lib/api/products";
import { formatPrice } from "@/lib/format-price";
import { getImageUrl } from "@/lib/get-image-url";
import {
  useCategoryBySlug,
  usePublicCategories,
  usePublicProducts,
} from "@/features/storefront/hooks/use-storefront";
import { useDocumentTitle } from "@/lib/use-document-title";

const PAGE_SIZE = 10;

type SortOption = "newest" | "price-asc" | "price-desc";

function ProductRow({ product }: { product: Product }) {
  const isOutOfStock = product.stock === 0;
  const detailChips = Object.entries(product.attributes).slice(0, 3);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex gap-4 border-b border-border py-4 first:pt-0 last:border-b-0 sm:gap-6"
    >
      <div className="size-28 shrink-0 overflow-hidden rounded-xl border border-border bg-card sm:size-36">
        {product.images[0] ? (
          <img
            src={getImageUrl(product.images[0], { width: 300 })}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <p className="line-clamp-2 text-base font-medium text-foreground sm:text-lg">
          {product.name}
        </p>
        <p className="text-2xl font-semibold text-primary">
          {formatPrice(product.price)}
        </p>

        {isOutOfStock && (
          <p className="text-xs font-medium text-destructive">
            Out of stock
          </p>
        )}

        {detailChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {detailChips.map(([key, value]) => (
              <span
                key={key}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function PaginationBar({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronLeftIcon className="size-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page}
          className={`flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
            p === page
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-accent"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  );
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: category,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useCategoryBySlug(slug ?? "");
  const { data: allCategories } = usePublicCategories();
  const { data: allProducts, isLoading: productsLoading } =
    usePublicProducts();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (category) setSelectedCategoryId(category.id);
  }, [category]);

  const selectedCategory =
    allCategories?.find((c) => c.id === selectedCategoryId) ?? category;

  useDocumentTitle(selectedCategory?.name);

  const filteredProducts = useMemo(() => {
    if (!allProducts || !selectedCategoryId) return [];

    const min = minPrice ? Number.parseFloat(minPrice) : null;
    const max = maxPrice ? Number.parseFloat(maxPrice) : null;

    const filtered = allProducts.filter((p) => {
      if (p.categoryId !== selectedCategoryId) return false;
      const price = Number.parseFloat(p.price);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "price-asc") {
        return Number.parseFloat(a.price) - Number.parseFloat(b.price);
      }
      if (sortBy === "price-desc") {
        return Number.parseFloat(b.price) - Number.parseFloat(a.price);
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [allProducts, selectedCategoryId, sortBy, minPrice, maxPrice]);

  // Reset to page 1 whenever the active category or filters change.
  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, sortBy, minPrice, maxPrice]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  if (categoryLoading) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1600px] px-6 py-12">
          <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-muted sm:h-36"
              />
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
          <p className="text-lg font-medium text-foreground">
            Category not found
          </p>
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
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {selectedCategory?.name}
          </h1>
          {selectedCategory?.description && (
            <p className="text-muted-foreground">
              {selectedCategory.description}
            </p>
          )}
        </div>

        {/* Category switcher, mobile/tablet: horizontal pills */}
        {allCategories && allCategories.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
            {allCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategoryId(c.id)}
                aria-current={c.id === selectedCategoryId}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  c.id === selectedCategoryId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-accent"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
          {/* Category switcher, desktop: vertical sidebar */}
          {allCategories && allCategories.length > 0 && (
            <nav
              aria-label="Categories"
              className="hidden shrink-0 border-r border-border pr-6 lg:block"
            >
              <ul className="divide-y divide-border">
                {allCategories.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(c.id)}
                      aria-current={c.id === selectedCategoryId}
                      className={`block w-full py-2.5 text-left text-sm transition-colors ${
                        c.id === selectedCategoryId
                          ? "font-semibold text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="min-w-0">
            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-border pb-6">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Sort
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Min price
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Max price
                <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                />
              </label>

              {(minPrice || maxPrice || sortBy !== "newest") && (
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setSortBy("newest");
                  }}
                  className="text-sm font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            {productsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl bg-muted sm:h-36"
                  />
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div>
                  {paginatedProducts.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </div>
                <PaginationBar
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center">
                <p className="text-muted-foreground">
                  No products match these filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}