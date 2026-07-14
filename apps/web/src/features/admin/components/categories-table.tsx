import { useState } from "react";
import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from "lucide-react";
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

type SortKey = "name" | "slug";
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

export function CategoriesTable() {
  const { data: categories, isLoading, isError, error } = useCategories();
  const deactivateCategory = useDeactivateCategory();
  const activateCategory = useActivateCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deactivatingCategory, setDeactivatingCategory] = useState<Category | null>(null);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const sortedCategories = (() => {
    if (!categories) return categories;
    if (!sortKey) return categories;

    const sorted = [...categories].sort((a, b) => {
      const comparison = a[sortKey].localeCompare(b[sortKey]);
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  })();

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

      {sortedCategories && sortedCategories.length === 0 ? (
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
              <TableHead>
                <SortableHeader
                  label="Name"
                  sortKey="name"
                  currentSort={sortKey}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Slug"
                  sortKey="slug"
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
            {sortedCategories?.map((category) => (
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

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editingCategory} />

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