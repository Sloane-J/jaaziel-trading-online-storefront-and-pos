import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ImageCarouselProps = {
  images: string[];
  alt: string;
  autoPlayMs?: number;
  showControls?: boolean;
};

const SWIPE_THRESHOLD = 40;

export function ImageCarousel({
  images,
  alt,
  autoPlayMs = 4000,
  showControls = false,
}: ImageCarouselProps) {
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

  // Guard against a stale index if `images` changes (e.g. switching product
  // variant) and the new array is shorter than the previous selection.
  useEffect(() => {
    setIndex((i) => (i >= images.length ? 0 : i));
  }, [images]);

  useEffect(() => {
    if (!hasMultiple || isPaused || prefersReducedMotion.current) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, images.length, autoPlayMs]);

  function goPrev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function goNext(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
      setIndex((i) =>
        touchDeltaX.current < 0
          ? (i + 1) % images.length
          : (i - 1 + images.length) % images.length,
      );
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  if (images.length === 0) {
    return <div className="size-full bg-muted" aria-hidden="true" />;
  }

  return (
    <div
      className="relative size-full overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label={alt}
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
          alt={i === 0 ? alt : ""}
          aria-hidden={i !== index}
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "auto"}
          decoding="async"
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {hasMultiple && (
        <span className="sr-only" aria-live="polite">
          {`Showing photo ${index + 1} of ${images.length}`}
        </span>
      )}

      {showControls && hasMultiple && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-black/30 px-3 py-2 backdrop-blur-md">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className="rounded-full p-1.5 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className="rounded-full p-1.5 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}