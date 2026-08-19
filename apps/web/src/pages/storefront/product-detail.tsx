import {
  HeartIcon,
  ShoppingBagIcon,
  ZapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/storefront/components/product-card";
import { useAddCartItem } from "@/features/storefront/hooks/use-cart";
import {
  usePublicCategories,
  usePublicProduct,
  usePublicProducts,
} from "@/features/storefront/hooks/use-storefront";
import { useDocumentTitle } from "@/lib/use-document-title";
import { getImageUrl } from "@/lib/get-image-url";

function formatPrice(price: string): string {
  return `GHS ${Number(price).toFixed(2)}`;
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = usePublicProduct(id ?? "");
  const addCartItem = useAddCartItem();
  const { data: categories } = usePublicCategories();
  const { data: relatedProducts } = usePublicProducts(product?.categoryId);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const category = categories?.find((c) => c.id === product?.categoryId);
  const attributesEntries = product ? Object.entries(product.attributes) : [];
  const isOutOfStock = product?.stock === 0;

  useDocumentTitle(product?.name);

  useEffect(() => {
    if (!product) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || undefined,
      image: product.images[0] || undefined,
      offers: {
        "@type": "Offer",
        priceCurrency: "GHS",
        price: product.price,
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
      },
    });

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  function handleBuyNow() {
    if (!product) return;

    addCartItem.mutate(
      { productId: product.id },
      {
        onSuccess: () => navigate("/checkout"),
      },
    );
  }

  const otherProducts = (relatedProducts ?? [])
    .filter((p) => p.id !== product?.id)
    .slice(0, 5);

  if (isLoading) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex w-full gap-4 lg:w-[60%]">
              <div className="hidden w-20 flex-col gap-2 md:flex">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square w-full animate-pulse rounded bg-muted"
                  />
                ))}
              </div>

              <div className="aspect-square w-full flex-1 animate-pulse rounded bg-muted" />
            </div>

            <div className="w-full space-y-4 lg:w-[40%]">
              <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />

              <div className="space-y-2 pt-4">
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (isError || !product) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-[1200px] px-6 py-24 text-center">
          <p className="text-lg font-medium text-foreground">
            Product not found
          </p>

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

  const hasMultipleImages = product.images.length > 1;

  function goPrevImage() {
    setActiveImageIndex(
      (i) => (i - 1 + product.images.length) % product.images.length,
    );
  }

  function goNextImage() {
    setActiveImageIndex((i) => (i + 1) % product.images.length);
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        {category && (
          <nav
            aria-label="Breadcrumb"
            className="mb-6 truncate text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-foreground hover:underline">
              Home
            </Link>

            <span className="mx-2">&gt;</span>

            <Link
              to={`/shop/${category.slug}`}
              className="hover:text-foreground hover:underline"
            >
              {category.name}
            </Link>

            <span className="mx-2">&gt;</span>

            <span className="text-foreground">{product.name}</span>
          </nav>
        )}

        {/* Product Gallery + Product Information */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          {/* Gallery */}
          <div className="flex min-w-0 gap-3 sm:gap-4">
            {/* Thumbnails */}
            {hasMultipleImages && (
              <div className="flex w-16 shrink-0 flex-col gap-3 overflow-y-auto sm:w-20">
                {product.images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    aria-label={`View photo ${i + 1}`}
                    aria-current={i === activeImageIndex}
                    className={`aspect-square w-full shrink-0 overflow-hidden rounded-lg border bg-muted transition-all ${
                      i === activeImageIndex
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getImageUrl(src, { width: 200 })}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      loading="lazy"
                      className="block size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-muted">
              <div className="aspect-square size-full sm:aspect-[4/3] lg:aspect-square">
                {product.images.length === 0 ? (
                  <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
                    No image available
                  </div>
                ) : (
                  <img
                    src={getImageUrl(product.images[activeImageIndex], {
                      width: 1200,
                    })}
                    alt={product.name}
                    className="block size-full object-cover"
                  />
                )}
              </div>

              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={goPrevImage}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/90 p-2.5 text-foreground shadow-md transition hover:bg-background"
                  >
                    <ChevronLeftIcon className="size-5" />
                  </button>

                  <button
                    type="button"
                    onClick={goNextImage}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/90 p-2.5 text-foreground shadow-md transition hover:bg-background"
                  >
                    <ChevronRightIcon className="size-5" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                    {activeImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="min-w-0 space-y-6 lg:pl-2">
            <div className="space-y-3 border-b border-border pb-6">
              <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {product.name}
              </h1>

              {category && (
                <p className="text-sm text-muted-foreground">
                  Category:{" "}
                  <Link
                    to={`/shop/${category.slug}`}
                    className="text-primary hover:underline"
                  >
                    {category.name}
                  </Link>
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Condition:</span>
                New
              </div>
            </div>

            <div className="space-y-3 rounded-xl bg-secondary/20 p-5">
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </p>

                {isOutOfStock && (
                  <span className="mb-1 text-sm font-semibold text-destructive">
                    Out of stock
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                + Shipping calculated at checkout
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                disabled={isOutOfStock || addCartItem.isPending}
                onClick={handleBuyNow}
                className="w-full gap-2 rounded-full font-bold transition-transform active:scale-[0.98]"
              >
                <ZapIcon className="size-5 fill-current" />
                {isOutOfStock ? "Out of stock" : "Buy It Now"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                disabled={isOutOfStock || addCartItem.isPending}
                onClick={() =>
                  addCartItem.mutate({ productId: product.id })
                }
                className="w-full gap-2 rounded-full border-2 border-primary text-primary transition-transform hover:bg-primary/5 active:scale-[0.98]"
              >
                <ShoppingBagIcon className="size-5" />
                {addCartItem.isPending ? "Adding..." : "Add to cart"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setIsWishlisted((v) => !v)}
                aria-pressed={isWishlisted}
                className="w-full gap-2 rounded-full text-foreground hover:bg-secondary/50"
              >
                <HeartIcon
                  className={`size-5 transition-colors ${
                    isWishlisted
                      ? "fill-primary text-primary"
                      : "text-foreground"
                  }`}
                />

                {isWishlisted ? "Watching" : "Add to Watchlist"}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="max-w-4xl space-y-8">
            {attributesEntries.length > 0 && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
                  Item specifics
                </h2>

                <div className="grid grid-cols-1 gap-x-8 gap-y-2 rounded-xl border border-border bg-card p-4 text-sm sm:grid-cols-2">
                  {attributesEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-wrap gap-2 border-b border-border/50 py-2 last:border-0"
                    >
                      <span className="min-w-[100px] font-medium text-muted-foreground">
                        {key}:
                      </span>

                      <span className="flex-1 font-medium text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
                Description
              </h2>

              <div className="rounded-xl border border-border bg-card p-6">
                {product.description ? (
                  <div className="text-sm leading-relaxed text-foreground">
                    <p className="whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No description provided by the seller.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Related Products */}
        {otherProducts.length > 0 && (
          <section className="mt-16 border-t border-border pt-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Similar items
              </h2>

              {category && (
                <Link
                  to={`/shop/${category.slug}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  See all
                </Link>
              )}
            </div>

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