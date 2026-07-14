type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
};

// Appends ImageKit's on-the-fly transformation params to a stored image URL.
// Resizes, compresses, and auto-converts to a modern format (WebP/AVIF) based
// on the browser's Accept header — no re-upload or manual conversion needed.
export function getImageUrl(url: string, options: ImageTransformOptions = {}): string {
  if (!url || !url.includes("ik.imagekit.io")) return url;

  const { width, height, quality = 75 } = options;

  const params: string[] = [`q-${quality}`, "f-auto"]; // f-auto = auto format (WebP/AVIF)
  if (width) params.push(`w-${width}`);
  if (height) params.push(`h-${height}`);

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tr=${params.join(",")}`;
}