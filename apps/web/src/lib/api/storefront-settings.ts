const API_URL = import.meta.env.VITE_API_URL;

export type BannerSlide = {
  image: string;
  buttonLabel: string | null;
  href: string | null;
};

export type StorefrontSettings = {
  tenantId: string;
  topBannerImages: BannerSlide[];
  secondBannerImages: BannerSlide[];
  heroPrimaryCategoryId: string | null;
  heroSecondaryCategoryId: string | null;
  spotlightCategoryIds: string[];
};

export type UpdateStorefrontSettingsInput = {
  topBannerImages?: BannerSlide[];
  secondBannerImages?: BannerSlide[];
  heroPrimaryCategoryId?: string | null;
  heroSecondaryCategoryId?: string | null;
  spotlightCategoryIds?: string[];
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error && typeof body.error === "string"
        ? body.error
        : `Request failed with status ${res.status}`;

    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function fetchStorefrontSettings(): Promise<StorefrontSettings> {
  const res = await fetch(`${API_URL}/storefront/settings`, {
    credentials: "include",
  });

  return handleResponse<StorefrontSettings>(res);
}

export async function updateStorefrontSettings(
  input: UpdateStorefrontSettingsInput,
): Promise<StorefrontSettings> {
  const res = await fetch(`${API_URL}/storefront/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return handleResponse<StorefrontSettings>(res);
}
