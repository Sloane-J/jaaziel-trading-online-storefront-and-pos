import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ImageIcon,
  LinkIcon,
  RotateCcwIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/features/admin/hooks/use-categories";
import {
  useStorefrontSettings,
  useUpdateStorefrontSettings,
} from "@/features/admin/hooks/use-storefront-settings";
import type { BannerSlide } from "@/lib/api/storefront-settings";

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function StorefrontDiagnosticsContent() {
  const { data: settings, isLoading } = useStorefrontSettings();
  const { data: categories } = useCategories();
  const updateSettings = useUpdateStorefrontSettings();
  const [resetOpen, setResetOpen] = useState(false);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading storefront settings…</p>;
  }

  if (!settings) {
    return (
      <p className="text-sm text-destructive">
        No storefront settings row found for this tenant. This is itself a
        data problem — the admin Storefront page normally creates this row
        automatically on first save.
      </p>
    );
  }

  const validCategoryIds = new Set((categories ?? []).map((c) => c.id));

  const categoryName = (id: string | null) =>
    id ? categories?.find((c) => c.id === id)?.name : null;

  const heroPrimaryBroken =
    settings.heroPrimaryCategoryId !== null &&
    !validCategoryIds.has(settings.heroPrimaryCategoryId);
  const heroSecondaryBroken =
    settings.heroSecondaryCategoryId !== null &&
    !validCategoryIds.has(settings.heroSecondaryCategoryId);

  const brokenSpotlightIds = settings.spotlightCategoryIds.filter(
    (id) => !validCategoryIds.has(id),
  );

  const invalidTopBannerSlides = settings.topBannerImages.filter(
    (slide) => !isValidUrl(slide.image),
  );
  const invalidSecondBannerSlides = settings.secondBannerImages.filter(
    (slide) => !isValidUrl(slide.image),
  );

  const hasAnyIssue =
    heroPrimaryBroken ||
    heroSecondaryBroken ||
    brokenSpotlightIds.length > 0 ||
    invalidTopBannerSlides.length > 0 ||
    invalidSecondBannerSlides.length > 0;

  function removeSpotlightId(id: string) {
    updateSettings.mutate({
      spotlightCategoryIds: settings!.spotlightCategoryIds.filter((sid) => sid !== id),
    });
  }

  function clearHeroPrimary() {
    updateSettings.mutate({ heroPrimaryCategoryId: null });
  }

  function clearHeroSecondary() {
    updateSettings.mutate({ heroSecondaryCategoryId: null });
  }

  function removeBannerSlide(
    field: "topBannerImages" | "secondBannerImages",
    image: string,
  ) {
    updateSettings.mutate({
      [field]: settings![field].filter((slide) => slide.image !== image),
    });
  }

  function handleResetAll() {
    updateSettings.mutate({
      topBannerImages: [],
      secondBannerImages: [],
      heroPrimaryCategoryId: null,
      heroSecondaryCategoryId: null,
      spotlightCategoryIds: [],
    });
    setResetOpen(false);
  }

  function renderBannerList(
    slides: BannerSlide[],
    field: "topBannerImages" | "secondBannerImages",
  ) {
    if (slides.length === 0) {
      return <p className="text-sm text-muted-foreground">None set</p>;
    }

    return (
      <ul className="space-y-1.5">
        {slides.map((slide) => {
          const broken = !isValidUrl(slide.image);
          return (
            <li
              key={slide.image}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-2 text-xs"
            >
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                <LinkIcon className="size-3 shrink-0 text-muted-foreground" />
                <span
                  className={
                    broken ? "text-destructive" : "truncate text-muted-foreground"
                  }
                >
                  {broken ? `Malformed URL: ${slide.image}` : slide.image}
                </span>
                {slide.buttonLabel && (
                  <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {slide.buttonLabel}
                  </span>
                )}
              </span>
              {broken && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeBannerSlide(field, slide.image)}
                  className="shrink-0 text-destructive hover:bg-destructive/10"
                >
                  <XIcon className="size-3.5" />
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading">Storefront Settings Diagnostics</h2>
        <p className="text-sm text-muted-foreground">
          Raw view of the homepage configuration, with broken references
          flagged. For normal editing, use the admin Storefront page.
        </p>
      </div>

      <div
        className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
          hasAnyIssue
            ? "border-destructive/40 bg-destructive/5 text-destructive"
            : "border-success/40 bg-success/5 text-success"
        }`}
      >
        {hasAnyIssue ? (
          <AlertTriangleIcon className="size-4 shrink-0" />
        ) : (
          <CheckCircle2Icon className="size-4 shrink-0" />
        )}
        {hasAnyIssue
          ? "One or more broken references found below."
          : "All references point to real, existing data."}
      </div>

      {/* Hero categories */}
      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">Hero categories</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">Primary</p>
            {settings.heroPrimaryCategoryId === null ? (
              <p className="mt-1 text-sm text-muted-foreground">Not set</p>
            ) : heroPrimaryBroken ? (
              <div className="mt-1 space-y-2">
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertTriangleIcon className="size-3.5" />
                  Points to a deleted category ({settings.heroPrimaryCategoryId})
                </p>
                <Button size="sm" variant="outline" onClick={clearHeroPrimary}>
                  <XIcon className="size-3.5" /> Clear field
                </Button>
              </div>
            ) : (
              <p className="mt-1 text-sm text-foreground">
                {categoryName(settings.heroPrimaryCategoryId)}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">Secondary</p>
            {settings.heroSecondaryCategoryId === null ? (
              <p className="mt-1 text-sm text-muted-foreground">Not set</p>
            ) : heroSecondaryBroken ? (
              <div className="mt-1 space-y-2">
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertTriangleIcon className="size-3.5" />
                  Points to a deleted category ({settings.heroSecondaryCategoryId})
                </p>
                <Button size="sm" variant="outline" onClick={clearHeroSecondary}>
                  <XIcon className="size-3.5" /> Clear field
                </Button>
              </div>
            ) : (
              <p className="mt-1 text-sm text-foreground">
                {categoryName(settings.heroSecondaryCategoryId)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Spotlight categories */}
      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-1.5">
          <StarIcon className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Spotlight categories ({settings.spotlightCategoryIds.length})
          </p>
        </div>

        {settings.spotlightCategoryIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">None set</p>
        ) : (
          <ul className="space-y-2">
            {settings.spotlightCategoryIds.map((id) => {
              const broken = !validCategoryIds.has(id);
              return (
                <li
                  key={id}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm"
                >
                  {broken ? (
                    <span className="flex items-center gap-1.5 text-destructive">
                      <AlertTriangleIcon className="size-3.5" />
                      Deleted category ({id})
                    </span>
                  ) : (
                    <span className="text-foreground">{categoryName(id)}</span>
                  )}
                  {broken && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSpotlightId(id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <XIcon className="size-3.5" /> Remove
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Banner images */}
      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Top banner ({settings.topBannerImages.length} images)
          </p>
        </div>
        {renderBannerList(settings.topBannerImages, "topBannerImages")}
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Second banner ({settings.secondBannerImages.length} images)
          </p>
        </div>
        {renderBannerList(settings.secondBannerImages, "secondBannerImages")}
      </section>

      {/* Danger zone */}
      <section className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
        <p className="text-sm font-semibold text-destructive">Danger zone</p>
        <p className="text-xs text-muted-foreground">
          Clears every field on this settings row — banners, hero categories,
          and spotlight categories. Cannot be undone; admin will need to
          reconfigure the homepage afterward.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="gap-1.5"
          onClick={() => setResetOpen(true)}
        >
          <RotateCcwIcon className="size-3.5" />
          Reset all to defaults
        </Button>
      </section>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all storefront settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears the banners, hero categories, and spotlight
              categories entirely. The homepage will show its empty states
              until an admin reconfigures it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll}>
              Reset everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}