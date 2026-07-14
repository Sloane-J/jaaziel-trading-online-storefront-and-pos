import {
  LayoutDashboardIcon,
  MenuIcon,
  ShoppingCartIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartDrawer } from "@/features/storefront/components/cart-drawer";
import { CategoriesMenu } from "@/features/storefront/components/categories-menu";
import { SearchBar } from "@/features/storefront/components/search-bar";
import { useCart } from "@/features/storefront/hooks/use-cart";
import { usePublicCategories } from "@/features/storefront/hooks/use-storefront";
import { useSession } from "@/hooks/use-session";

type StorefrontLayoutProps = {
  children: ReactNode;
};

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  superadmin: "/superadmin",
  cashier: "/pos",
  staff: "/orders",
};

const OUTLINE_LINK_CLASS =
  "inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground";

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const { data: session } = useSession();
  const { data: categories } = usePublicCategories();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: cartData } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount =
    cartData?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const role = (session?.user as { role?: string } | undefined)?.role;
  const dashboardHref = role ? ROLE_HOME[role] : undefined;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur transition-shadow">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:grid-cols-[1fr_auto_1fr] sm:px-6">
          {/* Left: hamburger (mobile) or search bar (desktop) */}
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                aria-label="Open menu"
                className="text-foreground transition-colors hover:text-muted-foreground lg:hidden"
              >
                <MenuIcon className="size-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="font-heading">
                    Jaaziel Trading
                  </SheetTitle>
                </SheetHeader>
                <nav
                  className="mt-6 flex flex-col gap-1 px-4"
                  aria-label="Mobile navigation"
                >
                  <p className="px-1 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Categories
                  </p>
                  {categories?.map((category) => (
                    <Link
                      key={category.id}
                      to={`/shop/${category.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      {category.name}
                    </Link>
                  ))}
                  <div className="my-2 border-t border-border" />
                  <Link
                    to="/contact"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    Contact
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            <div className="hidden sm:block">
              <SearchBar />
            </div>
          </div>

          {/* Center: logo */}
          <Link
            to="/"
            className="whitespace-nowrap font-heading text-lg font-semibold text-foreground sm:text-xl"
          >
            Jaaziel Trading
          </Link>

          {/* Right: nav links + cart + dashboard/login */}
          <div className="flex items-center justify-end gap-4 sm:gap-6">
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-6 lg:flex"
            >
              <CategoriesMenu />
              <Link
                to="/contact"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact
              </Link>
            </nav>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
              className="relative text-muted-foreground transition-colors hover:text-foreground"
            >
              <ShoppingCartIcon className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </button>

            {session && dashboardHref ? (
              <Link
                to={dashboardHref}
                className={`${OUTLINE_LINK_CLASS} hidden sm:inline-flex`}
              >
                <LayoutDashboardIcon className="size-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className={`${OUTLINE_LINK_CLASS} hidden sm:inline-flex`}
              >
                Log in
              </Link>
            )}
          </div>
        </div>

        {/* Search bar, mobile only, below the main row */}
        <div className="border-t border-border px-4 py-2 sm:hidden">
          <SearchBar />
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-[1600px] px-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Jaaziel Trading Enterprise
        </div>
      </footer>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}