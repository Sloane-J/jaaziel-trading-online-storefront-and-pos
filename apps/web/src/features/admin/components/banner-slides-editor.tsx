import { XIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/features/admin/components/image-upload";
import { useCategories } from "@/features/admin/hooks/use-categories";
import { getImageUrl } from "@/lib/get-image-url";

export type BannerSlide = {
  image: string;
  buttonLabel: string | null;
  href: string | null;
};

const NONE_VALUE = "__none__";

type BannerSlidesEditorProps = {
  slides: BannerSlide[];
  onChange: (slides: BannerSlide[]) => void;
  maxImages?: number;
};

export function BannerSlidesEditor({
  slides,
  onChange,
  maxImages = 5,
}: BannerSlidesEditorProps) {
  const { data: categories } = useCategories();
  const activeCategories = (categories ?? []).filter((c) => c.isActive);

  const imageUrls = slides.map((s) => s.image);

  function handleImagesChange(newUrls: string[]) {
    // A URL was added — append a new slide with no button set yet.
    const added = newUrls.filter((url) => !imageUrls.includes(url));
    // A URL was removed — drop the matching slide entirely.
    const removed = imageUrls.filter((url) => !newUrls.includes(url));

    let next = slides.filter((s) => !removed.includes(s.image));
    for (const url of added) {
      next = [...next, { image: url, buttonLabel: null, href: null }];
    }
    onChange(next);
  }

  function setSlideCategory(image: string, categoryId: string) {
    onChange(
      slides.map((s) => {
        if (s.image !== image) return s;
        if (categoryId === NONE_VALUE) {
          return { ...s, buttonLabel: null, href: null };
        }
        const category = activeCategories.find((c) => c.id === categoryId);
        if (!category) return s;
        return {
          ...s,
          buttonLabel: `Shop ${category.name}`,
          href: `/shop/${category.slug}`,
        };
      }),
    );
  }

  function categoryIdForSlide(slide: BannerSlide): string {
    if (!slide.href) return NONE_VALUE;
    const match = activeCategories.find((c) => `/shop/${c.slug}` === slide.href);
    return match?.id ?? NONE_VALUE;
  }

  return (
    <div className="space-y-4">
      <ImageUpload images={imageUrls} onChange={handleImagesChange} maxImages={maxImages} />

      {slides.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Button per banner (optional)
          </p>
          {slides.map((slide) => (
            <div
              key={slide.image}
              className="flex items-center gap-3 rounded-lg border border-border p-2.5"
            >
              <img
                src={getImageUrl(slide.image, { width: 100 })}
                alt=""
                className="size-12 shrink-0 rounded-md object-cover"
              />

              <div className="min-w-0 flex-1">
                <Select
                  value={categoryIdForSlide(slide)}
                  onValueChange={(value) => setSlideCategory(slide.image, value ?? NONE_VALUE)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No button (image only)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>No button (image only)</SelectItem>
                    {activeCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        Shop {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {slide.buttonLabel && (
                <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                  {slide.buttonLabel}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}