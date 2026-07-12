import type { Category } from "@/lib/api/categories";

type CategoryTilesProps = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function CategoryTiles({ categories, selectedId, onSelect }: CategoryTilesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedId === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-foreground hover:bg-accent/70"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}