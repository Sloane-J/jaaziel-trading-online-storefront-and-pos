import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateCategory,
	useUpdateCategory,
} from "@/features/admin/hooks/use-categories";
import type { Category } from "@/lib/api/categories";

type CategoryFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: Category | null; // null/undefined = create mode, provided = edit mode
};

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-");
}

export function CategoryFormDialog({
	open,
	onOpenChange,
	category,
}: CategoryFormDialogProps) {
	const isEditMode = Boolean(category);

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [description, setDescription] = useState("");
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory();

	const isSubmitting = createCategory.isPending || updateCategory.isPending;

	useEffect(() => {
		if (open) {
			setName(category?.name ?? "");
			setSlug(category?.slug ?? "");
			setDescription(category?.description ?? "");
			setSlugManuallyEdited(false);
			setError(null);
		}
	}, [open, category]);

	function handleNameChange(value: string) {
		setName(value);
		if (!slugManuallyEdited) {
			setSlug(slugify(value));
		}
	}

	function handleSlugChange(value: string) {
		setSlugManuallyEdited(true);
		setSlug(value);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (!name.trim() || !slug.trim()) {
			setError("Name and URL slug are both required.");
			return;
		}

		try {
			if (isEditMode && category) {
				await updateCategory.mutateAsync({
					id: category.id,
					input: { name, slug, description: description || undefined },
				});
			} else {
				await createCategory.mutateAsync({
					name,
					slug,
					description: description || undefined,
				});
			}
			onOpenChange(false);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again.",
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit category" : "New category"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="category-name">Name</Label>
						<Input
							id="category-name"
							value={name}
							onChange={(e) => handleNameChange(e.target.value)}
							placeholder="e.g. Phones & Accessories"
							autoFocus
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="category-slug">URL slug</Label>
						<Input
							id="category-slug"
							value={slug}
							onChange={(e) => handleSlugChange(e.target.value)}
							placeholder="e.g. phones-accessories"
						/>
						<p className="text-sm text-muted-foreground">
							Used in the web address for this category. Lowercase letters,
							numbers, and hyphens only.
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="category-description">Description (optional)</Label>
						<Textarea
							id="category-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="A short description shown to customers"
							rows={3}
						/>
					</div>

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? "Saving..."
								: isEditMode
									? "Save changes"
									: "Create category"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
