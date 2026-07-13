import { ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { uploadProductImage } from "@/lib/api/uploads";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ImageUploadProps = {
	images: string[];
	onChange: (images: string[]) => void;
	maxImages?: number;
};

export function ImageUpload({
	images,
	onChange,
	maxImages = 5,
}: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		setError(null);

		if (!ACCEPTED_TYPES.includes(file.type)) {
			setError("Please choose a JPG, PNG, or WEBP image.");
			return;
		}

		if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
			setError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
			return;
		}

		if (images.length >= maxImages) {
			setError(`You can add up to ${maxImages} images per product.`);
			return;
		}

		setIsUploading(true);
		try {
			const url = await uploadProductImage(file);
			onChange([...images, url]);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Upload failed. Please try again.",
			);
		} finally {
			setIsUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	}

	function removeImage(url: string) {
		onChange(images.filter((img) => img !== url));
	}

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap gap-3">
				{images.map((url) => (
					<div
						key={url}
						className="group relative size-24 overflow-hidden rounded-lg border border-border"
					>
						<img src={url} alt="" className="size-full object-cover" />
						<button
							type="button"
							onClick={() => removeImage(url)}
							aria-label="Remove image"
							className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
						>
							<XIcon className="size-3.5" />
						</button>
					</div>
				))}

				{images.length < maxImages && (
					<button
						type="button"
						onClick={() => inputRef.current?.click()}
						disabled={isUploading}
						aria-label="Add product image"
						className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
					>
						{isUploading ? (
							<Loader2Icon className="size-5 animate-spin" />
						) : (
							<>
								<ImagePlusIcon className="size-5" />
								<span className="text-xs">Add photo</span>
							</>
						)}
					</button>
				)}
			</div>

			<input
				ref={inputRef}
				type="file"
				accept={ACCEPTED_TYPES.join(",")}
				onChange={handleFileSelect}
				className="hidden"
			/>

			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}

			<p className="text-sm text-muted-foreground">
				Add up to {maxImages} photos. JPG, PNG, or WEBP, max {MAX_FILE_SIZE_MB}
				MB each.
			</p>
		</div>
	);
}
