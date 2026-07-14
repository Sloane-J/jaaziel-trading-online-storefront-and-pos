import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  SearchIcon,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "@/features/admin/components/product-form-dialog";
import { useCategories } from "@/features/admin/hooks/use-categories";
import {
  useActivateProduct,
  useDeactivateProduct,
  useProducts,
} from "@/features/admin/hooks/use-products";
import type { Product } from "@/lib/api/products";
import { formatPrice } from "@/lib/format-price";
import { getImageUrl } from "@/lib/get-image-url";

type SortKey = "name" | "price" | "stock";
type SortDirection = "asc" | "desc";

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDirection,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey | null;
  currentDirection: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSort === sortKey;
  const Icon = isActive
    ? currentDirection === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon
    : ArrowUpDownIcon;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-left font-medium transition-colors hover:text-foreground ${
        isActive ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {label}
      <Icon className="size-3.5" aria-hidden="true" />
    </button>
  );
}

export function ProductsTable() {
  const { data: products, isLoading, isError, error } = useProducts();
  const { data: categories } = useCategories();
  const deactivateProduct = useDeactivateProduct();
  const activateProduct = useActivateProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deactivatingProduct, setDeactivatingProduct] =
    useState<Product | null>(null);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryNameById = new Map(
    (categories ?? []).map((c) => [c.id, c.name]),
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const filteredProducts = (() => {
    if (!products) return products;
    if (!searchQuery.trim()) return products;

    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  })();

  const sortedProducts = (() => {
    if (!filteredProducts) return filteredProducts;
    if (!sortKey) return filteredProducts;

    const sorted = [...filteredProducts].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") comparison = a.name.localeCompare(b.name);
      if (sortKey === "price") comparison = Number(a.price) - Number(b.price);
      if (sortKey === "stock") comparison = a.stock - b.stock;
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  })();

  function openCreateForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function confirmDeactivate() {
    if (!deactivatingProduct) return;
    await deactivateProduct.mutateAsync(deactivatingProduct.id);
    setDeactivatingProduct(null);
  }

  async function handleActivate(product: Product) {
    await activateProduct.mutateAsync(product.id);
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading products…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive">
        Couldn't load products:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-heading">Products</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:w-64"
              aria-label="Search products"
            />
          </div>
          <Button onClick={openCreateForm}>Add product</Button>
        </div>
      </div>

      {sortedProducts && sortedProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No products match your search."
              : "No products yet."}
          </p>
          {!searchQuery && (
            <Button variant="outline" className="mt-4" onClick={openCreateForm}>
              Create your first product
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>
                <SortableHeader
                  label="Name"
                  sortKey="name"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <SortableHeader
                  label="Price"
                  sortKey="price"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Stock"
                  sortKey="stock"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images[0] ? (
                    <img
                    src={getImageUrl(product.images[0], { width: 60 })}
                      alt=""
                      loading="lazy"
                      className="size-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="size-10 rounded-md bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {categoryNameById.get(product.categoryId) ?? "—"}
                </TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  {product.stock === 0 ? (
                    <span className="text-destructive">Out of stock</span>
                  ) : (
                    product.stock
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(product)}
                  >
                    Edit
                  </Button>
                  {product.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeactivatingProduct(product)}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivate(product)}
                    >
                      Reactivate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
      />

      <AlertDialog
        open={Boolean(deactivatingProduct)}
        onOpenChange={(open) => !open && setDeactivatingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this product?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deactivatingProduct?.name}" will be hidden from the storefront.
              You can reactivate it later by editing it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
