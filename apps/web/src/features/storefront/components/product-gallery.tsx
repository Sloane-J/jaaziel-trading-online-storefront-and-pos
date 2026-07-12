import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

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
		<div className="space-y-3">
			<div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted">
				<img
					src={images[index]}
					alt={alt}
					className="size-full object-cover transition-opacity duration-300"
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

			{hasMultiple && (
				<div className="flex gap-2">
					{images.map((src, i) => (
						<button
							key={src}
							type="button"
							onClick={() => setIndex(i)}
							aria-label={`View photo ${i + 1}`}
							className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
								i === index ? "border-primary" : "border-transparent"
							}`}
						>
							<img src={src} alt="" className="size-full object-cover" />
						</button>
					))}
				</div>
			)}
		</div>
	);
}
