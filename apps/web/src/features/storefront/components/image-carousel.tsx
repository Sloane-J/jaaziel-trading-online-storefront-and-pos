import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

type ImageCarouselProps = {
  images: string[];
  alt: string;
  autoPlayMs?: number;
  showControls?: boolean;
};

export function ImageCarousel({
  images,
  alt,
  autoPlayMs = 4000,
  showControls = false,
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [hasMultiple, images.length, autoPlayMs]);

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

  if (images.length === 0) {
    return <div className="size-full bg-muted" aria-hidden="true" />;
  }

  return (
    <div className="relative size-full overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? alt : ""}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {showControls && hasMultiple && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-black/30 px-3 py-2 backdrop-blur-md">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className="rounded-full p-1.5 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className="rounded-full p-1.5 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}