const API_URL = import.meta.env.VITE_API_URL;
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

type ImageKitAuthParams = {
  token: string;
  expire: number;
  signature: string;
};

async function getImageKitAuthParams(): Promise<ImageKitAuthParams> {
  const res = await fetch(`${API_URL}/uploads/imagekit-auth`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Could not authorize upload. Please try again.");
  }

  return res.json();
}

export async function uploadProductImage(file: File): Promise<string> {
  const { token, expire, signature } = await getImageKitAuthParams();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
  formData.append("signature", signature);
  formData.append("expire", String(expire));
  formData.append("token", token);
  formData.append("folder", "/products");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Image upload failed. Please try again.");
  }

  const data = await res.json();
  return data.url as string;
}

export { IMAGEKIT_URL_ENDPOINT };