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

  const attributesEntries = product
    ? Object.entries(product.attributes)
    : [];

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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            <div className="flex gap-4">
              <div className="hidden w-20 flex-col gap-3 md:flex">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square w-full animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>

              <div className="aspect-square flex-1 animate-pulse rounded-xl bg-muted" />
            </div>

            <div className="space-y-6">
              <div className="h-8 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-10 w-1/2 animate-pulse rounded bg-muted" />

              <div className="space-y-3">
                <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
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
          <div className="mx-auto max-w-md">
            <p className="text-lg font-semibold text-foreground">
              Product not found
            </p>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This product may have been removed or is no longer available.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  const hasMultipleImages = product.images.length > 1;

  const imageCount = product.images.length;
  
  function goPrevImage() {
    setActiveImageIndex((i) => (i - 1 + imageCount) % imageCount);
  }
  
  function goNextImage() {
    setActiveImageIndex((i) => (i + 1) % imageCount);
  }

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:py-8">
        {/* Breadcrumbs */}
        {category && (
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex min-w-0 items-center gap-2 overflow-hidden text-sm text-muted-foreground"
          >
            <Link
              to="/"
              className="shrink-0 transition-colors hover:text-foreground"
            >
              Home
            </Link>

            <span className="shrink-0 text-muted-foreground/50">/</span>

            <Link
              to={`/shop/${category.slug}`}
              className="shrink-0 transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>

            <span className="shrink-0 text-muted-foreground/50">/</span>

            <span className="truncate text-foreground">
              {product.name}
            </span>
          </nav>
        )}

        {/* Main Product */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:gap-10">
          {/* Gallery */}
          <div className="flex min-w-0 gap-3 sm:gap-4">
            {hasMultipleImages && (
              <div className="flex w-16 shrink-0 flex-col gap-3 sm:w-20">
                <div className="flex max-h-[600px] flex-col gap-3 overflow-y-auto">
                  {product.images.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      aria-label={`View photo ${i + 1}`}
                      aria-current={i === activeImageIndex}
                      className={`aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-muted transition-all ${
                        i === activeImageIndex
                          ? "ring-2 ring-primary ring-offset-2"
                          : "opacity-65 hover:opacity-100"
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
              </div>
            )}

            {/* Main Image */}
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-muted">
              <div className="aspect-square w-full sm:aspect-[4/3] lg:aspect-square">
                {product.images.length === 0 ? (
                  <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
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
                    className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
                  >
                    <ChevronLeftIcon className="size-5" />
                  </button>

                  <button
                    type="button"
                    onClick={goNextImage}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
                  >
                    <ChevronRightIcon className="size-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                    {activeImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="min-w-0">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                {product.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {category && (
                  <Link
                    to={`/shop/${category.slug}`}
                    className="text-primary transition-colors hover:underline"
                  >
                    {category.name}
                  </Link>
                )}

                <span className="text-muted-foreground/40">•</span>

                <span>
                  Condition:{" "}
                  <span className="font-medium text-foreground">New</span>
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {formatPrice(product.price)}
                </p>

                {isOutOfStock && (
                  <span className="text-sm font-semibold text-destructive">
                    Out of stock
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-sm text-muted-foreground">
                Shipping calculated at checkout
              </p>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="mt-5">
                <h2 className="mb-3 font-heading text-xl font-bold text-foreground">
                  Description
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-7 flex max-w-md flex-col gap-3">
              <Button
                size="lg"
                disabled={isOutOfStock || addCartItem.isPending}
                onClick={handleBuyNow}
                className="h-12 w-full gap-2 rounded-full text-base font-semibold shadow-sm transition-transform active:scale-[0.99]"
              >
                <ZapIcon className="size-5 fill-current" />
                {isOutOfStock ? "Out of stock" : "Buy It Now"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                disabled={isOutOfStock || addCartItem.isPending}
                onClick={() =>
                  addCartItem.mutate({
                    productId: product.id,
                  })
                }
                className="h-12 w-full gap-2 rounded-full border-2 border-primary text-base font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-[0.99]"
              >
                <ShoppingBagIcon className="size-5" />
                {addCartItem.isPending ? "Adding..." : "Add to cart"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => setIsWishlisted((v) => !v)}
                aria-pressed={isWishlisted}
                className="h-12 w-full max-w-md gap-2 rounded-full text-base font-medium text-foreground hover:bg-secondary/60"
              >
                <HeartIcon
                  className={`size-5 ${
                    isWishlisted
                      ? "fill-primary text-primary"
                      : "text-foreground"
                  }`}
                />

                {isWishlisted
                  ? "Added to watchlist"
                  : "Add to watchlist"}
              </Button>
            </div>

            {/* Basic Trust Information */}
            <div className="mt-7 grid max-w-md grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  Secure checkout
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  Safe and secure payment
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground">
                  Delivery available
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  Shipping calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Item Specifics */}
        {attributesEntries.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <div className="max-w-4xl">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Item specifics
              </h2>

              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {attributesEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex gap-4 border-b border-border px-4 py-3 text-sm last:border-b-0 sm:nth-last-2:border-b-0"
                    >
                      <span className="min-w-[110px] font-medium text-muted-foreground">
                        {key}
                      </span>

                      <span className="font-medium text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Similar Items */}
        {otherProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                  You may also like
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  More products you might be interested in
                </p>
              </div>

              {category && (
                <Link
                  to={`/shop/${category.slug}`}
                  className="shrink-0 text-sm font-semibold text-primary transition-colors hover:underline"
                >
                  View all
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