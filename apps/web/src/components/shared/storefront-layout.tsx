import {
  AtSignIcon,
  MenuIcon,
  Share2Icon,
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

type StorefrontLayoutProps = {
  children: ReactNode;
};

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const { data: categories } = usePublicCategories();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: cartData } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount =
    cartData?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur transition-shadow">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:grid-cols-[1fr_minmax(220px,42rem)_1fr] sm:px-6">
          {/* Left: hamburger (mobile) + brand name */}
          <div className="flex items-center gap-2 sm:gap-3">
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

            <Link to="/" className="flex items-center gap-2">
              {/* Brand logo — uncomment and replace src once the logo asset is ready */}
              {/* <img src="/logo.svg" alt="" className="size-7 shrink-0" /> */}
              <span className="whitespace-nowrap font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Jaaziel Trading
              </span>
            </Link>
          </div>

          {/* Center: search bar (desktop) */}
          <div className="hidden sm:block">
            <SearchBar />
          </div>

          {/* Right: nav links + cart */}
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
          </div>
        </div>

        {/* Search bar, mobile only, below the main row */}
        <div className="border-t border-border px-4 py-2 sm:hidden">
          <SearchBar />
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-[1600px] px-6 py-12 sm:py-14">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                {/* Brand logo — uncomment and replace src once the logo asset is ready */}
                {/* <img src="/logo.svg" alt="" className="size-7 shrink-0" /> */}
                <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                  Jaaziel Trading
                </span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Quality goods, trusted service. Shop online or visit us
                in-store.
              </p>
              <div className="mt-5 flex items-center gap-4">
                <a
                  href="#"
                  aria-label="Social media"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Share2Icon className="size-5" />
                </a>
                <a
                  href="#"
                  aria-label="Email us"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <AtSignIcon className="size-5" />
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">Shop</h3>
              <ul className="mt-4 space-y-3">
                {categories?.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/shop/${category.slug}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/search"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Search products
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Company
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Customer Service
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Returns & Refunds
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Track Order
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Jaaziel Trading Enterprise. All
              rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Accra, Ghana
            </p>
          </div>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}