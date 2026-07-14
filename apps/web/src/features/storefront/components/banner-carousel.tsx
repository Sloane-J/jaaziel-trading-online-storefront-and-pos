import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

type BannerCarouselProps = {
  images: string[];
  autoPlayMs?: number;
};

export function BannerCarousel({
  images,
  autoPlayMs = 5000,
}: BannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [hasMultiple, images.length, autoPlayMs]);

  function goPrev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % images.length);
  }

  if (images.length === 0) return null;

  return (
    <div className="relative mx-auto h-56 w-full max-w-[1600px] overflow-hidden rounded-3xl px-6 md:h-80">
      <div className="relative size-full overflow-hidden rounded-3xl">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous banner"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next banner"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <ChevronRightIcon className="size-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to banner ${i + 1}`}
                  className="h-1.5 w-6 origin-left rounded-full bg-white/60 transition-transform duration-200"
                  style={{
                    transform: i === index ? "scaleX(1)" : "scaleX(0.25)",
                  }}
                >
                  <span
                    className={`block h-full w-full rounded-full transition-colors ${
                      i === index ? "bg-white" : "bg-transparent"
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
