import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	fetchStorefrontSettings,
	type UpdateStorefrontSettingsInput,
	updateStorefrontSettings,
} from "@/lib/api/storefront-settings";

const SETTINGS_KEY = ["admin", "storefront-settings"] as const;

export function useStorefrontSettings() {
	return useQuery({
		queryKey: SETTINGS_KEY,
		queryFn: fetchStorefrontSettings,
	});
}

export function useUpdateStorefrontSettings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateStorefrontSettingsInput) =>
			updateStorefrontSettings(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
			// Also invalidate the public-facing homepage cache so admin changes reflect immediately
			// if the admin flips back to view the live storefront in the same session.
			queryClient.invalidateQueries({ queryKey: ["storefront", "home"] });
			queryClient.invalidateQueries({
				queryKey: ["storefront", "categories-preview"],
			});
		},
	});
}
