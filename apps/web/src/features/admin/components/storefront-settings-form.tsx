import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/features/admin/components/image-upload";
import { useCategories } from "@/features/admin/hooks/use-categories";
import {
  useStorefrontSettings,
  useUpdateStorefrontSettings,
} from "@/features/admin/hooks/use-storefront-settings";

const NONE_VALUE = "__none__";

export function StorefrontSettingsForm() {
  const { data: settings, isLoading } = useStorefrontSettings();
  const { data: categories } = useCategories();
  const updateSettings = useUpdateStorefrontSettings();

  const [topBannerImages, setTopBannerImages] = useState<string[]>([]);
  const [secondBannerImages, setSecondBannerImages] = useState<string[]>([]);
  const [heroPrimaryCategoryId, setHeroPrimaryCategoryId] = useState<string>(NONE_VALUE);
  const [heroSecondaryCategoryId, setHeroSecondaryCategoryId] = useState<string>(NONE_VALUE);
  const [spotlightIds, setSpotlightIds] = useState<[string, string, string]>([
    NONE_VALUE,
    NONE_VALUE,
    NONE_VALUE,
  ]);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setTopBannerImages(settings.topBannerImages ?? []);
    setSecondBannerImages(settings.secondBannerImages ?? []);
    setHeroPrimaryCategoryId(settings.heroPrimaryCategoryId ?? NONE_VALUE);
    setHeroSecondaryCategoryId(settings.heroSecondaryCategoryId ?? NONE_VALUE);
    const existing = settings.spotlightCategoryIds ?? [];
    setSpotlightIds([
      existing[0] ?? NONE_VALUE,
      existing[1] ?? NONE_VALUE,
      existing[2] ?? NONE_VALUE,
    ]);
  }, [settings]);

  const activeCategories = (categories ?? []).filter((c) => c.isActive);

  function updateSpotlightSlot(index: number, value: string) {
    const next = [...spotlightIds] as [string, string, string];
    next[index] = value;
    setSpotlightIds(next);
  }

  async function handleSave() {
    setSaveState("saving");
    setError(null);

    try {
      await updateSettings.mutateAsync({
        topBannerImages,
        secondBannerImages,
        heroPrimaryCategoryId: heroPrimaryCategoryId === NONE_VALUE ? null : heroPrimaryCategoryId,
        heroSecondaryCategoryId:
          heroSecondaryCategoryId === NONE_VALUE ? null : heroSecondaryCategoryId,
        spotlightCategoryIds: spotlightIds.filter((id) => id !== NONE_VALUE),
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading storefront settings…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Storefront</h2>
        <Button onClick={handleSave} disabled={saveState === "saving"}>
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save changes"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Top banner */}
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top banner</h3>
          <p className="text-sm text-muted-foreground">
            Wide images shown at the very top of the homepage. Add more than one for a rotating
            carousel.
          </p>
        </div>
        <ImageUpload images={topBannerImages} onChange={setTopBannerImages} maxImages={5} />
      </section>

      {/* Hero categories */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Featured categories (hero)</h3>
          <p className="text-sm text-muted-foreground">
            The two categories shown in the large featured section. Their most recent product is
            displayed automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Primary (large)</Label>
            <Select value={heroPrimaryCategoryId} onValueChange={setHeroPrimaryCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>None</SelectItem>
                {activeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Secondary (square)</Label>
            <Select value={heroSecondaryCategoryId} onValueChange={setHeroSecondaryCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>None</SelectItem>
                {activeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Spotlight categories */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Spotlight categories</h3>
          <p className="text-sm text-muted-foreground">
            Up to 3 categories shown together in the "Our top picks" section.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2">
              <Label>Slot {index + 1}</Label>
              <Select
                value={spotlightIds[index]}
                onValueChange={(value) => updateSpotlightSlot(index, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None</SelectItem>
                  {activeCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </section>

      {/* Second banner */}
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Second banner</h3>
          <p className="text-sm text-muted-foreground">
            A second wide banner shown further down the homepage.
          </p>
        </div>
        <ImageUpload images={secondBannerImages} onChange={setSecondBannerImages} maxImages={5} />
      </section>
    </div>
  );
}