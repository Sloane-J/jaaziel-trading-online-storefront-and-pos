import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  useCategories,
  useDeactivateCategory,
  useActivateCategory,
} from "@/features/admin/hooks/use-categories";
import { CategoryFormDialog } from "@/features/admin/components/category-form-dialog";
import type { Category } from "@/lib/api/categories";

export function CategoriesTable() {
  const { data: categories, isLoading, isError, error } = useCategories();
  const deactivateCategory = useDeactivateCategory();
  const activateCategory = useActivateCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deactivatingCategory, setDeactivatingCategory] = useState<Category | null>(null);

  function openCreateForm() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  async function confirmDeactivate() {
    if (!deactivatingCategory) return;
    await deactivateCategory.mutateAsync(deactivatingCategory.id);
    setDeactivatingCategory(null);
  }

  async function handleActivate(category: Category) {
    await activateCategory.mutateAsync(category.id);
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Loading categories…</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-destructive">
        Couldn't load categories: {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading">Categories</h2>
        <Button onClick={openCreateForm}>Add category</Button>
      </div>

      {categories && categories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No categories yet.</p>
          <Button variant="outline" className="mt-4" onClick={openCreateForm}>
            Create your first category
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditForm(category)}>
                    Edit
                  </Button>
                  {category.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeactivatingCategory(category)}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleActivate(category)}>
                      Reactivate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
      />

      <AlertDialog
        open={Boolean(deactivatingCategory)}
        onOpenChange={(open) => !open && setDeactivatingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this category?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deactivatingCategory?.name}" will be hidden from the storefront. You can
              reactivate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate}>Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}