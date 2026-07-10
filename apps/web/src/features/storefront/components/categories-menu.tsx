import { useState } from "react";
import { Link } from "react-router";
import { ChevronDownIcon } from "lucide-react";
import { usePublicCategories } from "@/features/storefront/hooks/use-storefront";

export function CategoriesMenu() {
  const { data: categories } = usePublicCategories();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Categories
        <ChevronDownIcon
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 transition-all duration-200 ease-out ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {categories && categories.length > 0 ? (
            <ul className="py-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/shop/${category.slug}`}
                    className="block px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground">No categories yet</p>
          )}
        </div>
      </div>
    </div>
  );
}