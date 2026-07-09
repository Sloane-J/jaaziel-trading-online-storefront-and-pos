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

export function ProductsTable() {
  const { data: products, isLoading, isError, error } = useProducts();
  const { data: categories } = useCategories();
  const deactivateProduct = useDeactivateProduct();
  const activateProduct = useActivateProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deactivatingProduct, setDeactivatingProduct] =
    useState<Product | null>(null);

  const categoryNameById = new Map(
    (categories ?? []).map((c) => [c.id, c.name]),
  );

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Products</h2>
        <Button onClick={openCreateForm}>Add product</Button>
      </div>

      {products && products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No products yet.</p>
          <Button variant="outline" className="mt-4" onClick={openCreateForm}>
            Create your first product
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt=""
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
                <TableCell>GHS {Number(product.price).toFixed(2)}</TableCell>
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