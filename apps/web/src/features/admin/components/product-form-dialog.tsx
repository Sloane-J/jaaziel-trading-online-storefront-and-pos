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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AttributesBuilder } from "@/features/admin/components/attributes-builder";
import { ImageUpload } from "@/features/admin/components/image-upload";
import { useCategories } from "@/features/admin/hooks/use-categories";
import {
	useCreateProduct,
	useUpdateProduct,
} from "@/features/admin/hooks/use-products";
import type { Product } from "@/lib/api/products";

type ProductFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: Product | null; // null/undefined = create mode, provided = edit mode
};

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-");
}

export function ProductFormDialog({
	open,
	onOpenChange,
	product,
}: ProductFormDialogProps) {
	const isEditMode = Boolean(product);

	const { data: categories } = useCategories();
	const createProduct = useCreateProduct();
	const updateProduct = useUpdateProduct();

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
	const [categoryId, setCategoryId] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [stock, setStock] = useState("0");
	const [images, setImages] = useState<string[]>([]);
	const [attributes, setAttributes] = useState<Record<string, string>>({});
	const [error, setError] = useState<string | null>(null);

	const isSubmitting = createProduct.isPending || updateProduct.isPending;

	useEffect(() => {
		if (open) {
			setName(product?.name ?? "");
			setSlug(product?.slug ?? "");
			setSlugManuallyEdited(false);
			setCategoryId(product?.categoryId ?? "");
			setDescription(product?.description ?? "");
			setPrice(product?.price ?? "");
			setStock(String(product?.stock ?? 0));
			setImages(product?.images ?? []);
			setAttributes(product?.attributes ?? {});
			setError(null);
		}
	}, [open, product]);

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
		if (!categoryId) {
			setError("Please choose a category.");
			return;
		}
		const priceNumber = Number(price);
		if (!price || Number.isNaN(priceNumber) || priceNumber <= 0) {
			setError("Please enter a valid price.");
			return;
		}
		const stockNumber = Number(stock);
		if (Number.isNaN(stockNumber) || stockNumber < 0) {
			setError("Stock cannot be negative.");
			return;
		}

		const input = {
			categoryId,
			name,
			slug,
			description: description || undefined,
			price: priceNumber,
			stock: stockNumber,
			images,
			attributes,
		};

		try {
			if (isEditMode && product) {
				await updateProduct.mutateAsync({ id: product.id, input });
			} else {
				await createProduct.mutateAsync(input);
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
			<DialogContent
				aria-describedby={undefined}
				className="max-h-[85vh] overflow-y-auto sm:max-w-lg"
			>
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit product" : "New product"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="product-name">Name</Label>
						<Input
							id="product-name"
							value={name}
							onChange={(e) => handleNameChange(e.target.value)}
							placeholder="e.g. Wireless Earbuds"
							autoFocus
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="product-slug">URL slug</Label>
						<Input
							id="product-slug"
							value={slug}
							onChange={(e) => handleSlugChange(e.target.value)}
							placeholder="e.g. wireless-earbuds"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="product-category">Category</Label>
						<Select value={categoryId} onValueChange={setCategoryId}>
							<SelectTrigger id="product-category">
								<SelectValue placeholder="Choose a category" />
							</SelectTrigger>
							<SelectContent>
								{categories
									?.filter((c) => c.isActive)
									.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="product-price">Price (GHS)</Label>
							<Input
								id="product-price"
								type="number"
								inputMode="decimal"
								step="0.01"
								min="0"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								placeholder="0.00"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="product-stock">Stock</Label>
							<Input
								id="product-stock"
								type="number"
								inputMode="numeric"
								min="0"
								step="1"
								value={stock}
								onChange={(e) => setStock(e.target.value)}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="product-description">Description (optional)</Label>
						<Textarea
							id="product-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="A short description shown to customers"
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label>Photos</Label>
						<ImageUpload images={images} onChange={setImages} />
					</div>

					<AttributesBuilder attributes={attributes} onChange={setAttributes} />

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
									: "Create product"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
