import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type BannerCarouselProps = {
  images: string[];
  autoPlayMs?: number;
};

// Minimum horizontal drag distance (px) before a touch gesture counts as a swipe.
const SWIPE_THRESHOLD = 40;

export function BannerCarousel({
  images,
  autoPlayMs = 5000,
}: BannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const prefersReducedMotion = useRef(false);

  const hasMultiple = images.length > 1;

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (!hasMultiple || isPaused || prefersReducedMotion.current) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, images.length, autoPlayMs]);

  function goPrev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % images.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }

  function handleTouchEnd() {
    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD) {
      if (touchDeltaX.current < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  if (images.length === 0) return null;

  return (
    // Full-bleed technique: breaks out of any parent's max-width/padding by
    // centering a viewport-width element regardless of the parent container.
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
      <div
        className="relative aspect-[3/2] w-full overflow-hidden sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1]"
        role="region"
        aria-roledescription="carousel"
        aria-label="Promotional banners"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${images.length}`}
            aria-hidden={i !== index}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
            decoding="async"
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Visually hidden live region announcing slide changes to screen readers */}
        <span className="sr-only" aria-live="polite">
          {`Showing banner ${index + 1} of ${images.length}`}
        </span>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous banner"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next banner"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
                  aria-current={i === index}
                  className="h-1.5 w-6 origin-left rounded-full bg-white/60 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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