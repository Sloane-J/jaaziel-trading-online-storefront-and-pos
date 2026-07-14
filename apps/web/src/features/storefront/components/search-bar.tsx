import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { SearchIcon, Loader2Icon } from "lucide-react";
import { useProductSearch } from "@/features/storefront/hooks/use-storefront";
import { formatPrice } from "@/lib/format-price";

export function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useProductSearch(debouncedQuery);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleResultClick(productId: string) {
    setOpen(false);
    setQuery("");
    navigate(`/products/${productId}`);
  }

  const showDropdown = open && debouncedQuery.trim().length > 1;

  return (
    <div ref={containerRef} className="relative max-w-xs">
      <form onSubmit={handleSubmit}>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search products..."
          aria-label="Search products"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-full border border-input bg-muted/40 py-2 pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background"
        />
      </form>

      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Searching…
            </div>
          ) : results && results.length > 0 ? (
            <>
              <ul className="max-h-80 overflow-y-auto py-2">
                {results.slice(0, 6).map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleResultClick(product.id)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-accent"
                    >
                      <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="size-full bg-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleSubmit}
                className="block w-full border-t border-border px-4 py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-accent"
              >
                See all results for "{debouncedQuery}"
              </button>
            </>
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No products found for "{debouncedQuery}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}