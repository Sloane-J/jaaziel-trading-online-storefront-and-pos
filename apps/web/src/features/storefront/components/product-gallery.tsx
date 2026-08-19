import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { getImageUrl } from "@/lib/get-image-url";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-2xl bg-muted" />;
  }

  function goPrev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % images.length);
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === index}
              className={`size-14 shrink-0 overflow-hidden rounded-lg transition-all duration-200 sm:size-16 ${
                i === index
                  ? "opacity-100 ring-2 ring-primary"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={getImageUrl(src, { width: 150 })}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex h-[360px] w-full flex-1 items-center justify-center overflow-hidden rounded-2xl bg-muted sm:h-[460px] lg:h-[560px]">
        <img
          src={getImageUrl(images[index], { width: 800 })}
          alt={alt}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-opacity duration-300"
        />
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}