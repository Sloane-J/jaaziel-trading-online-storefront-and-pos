import {
  MenuIcon,
  PhoneIcon,
  Share2Icon,
  ShoppingCartIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
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

  // Container ref for the themed wrapper — Sheets portal into this
  // instead of document.body, so they inherit .storefront-theme variables.
  const themeContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={themeContainerRef} className="storefront-theme min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-primary shadow-sm">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:grid-cols-[1fr_minmax(220px,42rem)_1fr] sm:px-6 sm:py-4">
          {/* Left: hamburger (mobile) + brand name */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                aria-label="Open menu"
                className="flex size-8 items-center justify-center rounded-full text-primary-foreground transition-colors hover:bg-primary-light/30 lg:hidden"
              >
                <MenuIcon className="size-5" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72"
                container={themeContainerRef.current}
              >
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
                      className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-light/20 hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  ))}
                  <div className="my-2 border-t border-border" />
                  <Link
                    to="/services"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-light/20 hover:text-primary"
                  >
                    Services
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-light/20 hover:text-primary"
                  >
                    <PhoneIcon className="size-4" />
                    Contact
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2">
              {/* Brand logo — uncomment and replace src once the logo asset is ready */}
              {/* <img src="/logo.svg" alt="" className="size-7 shrink-0" /> */}
              <span className="whitespace-nowrap font-heading text-lg font-bold tracking-tight text-primary-foreground sm:text-xl">
                Jaaziel Trading
              </span>
            </Link>
          </div>

          {/* Center: search bar (desktop) */}
          <div className="hidden sm:block">
            <SearchBar />
          </div>

          {/* Right: nav links + icons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-6 lg:flex"
            >
              <CategoriesMenu />
              <Link
                to="/services"
                className="text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground"
              >
                Services
              </Link>
            </nav>

            <Link
              to="/contact"
              aria-label="Contact us"
              className="flex size-8 items-center justify-center rounded-full bg-primary-light text-primary-light-foreground transition-transform hover:scale-105"
            >
              <PhoneIcon className="size-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
              className="relative flex size-8 items-center justify-center rounded-full bg-primary-light text-primary-light-foreground transition-transform hover:scale-105"
            >
              <ShoppingCartIcon className="size-3.5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-semibold text-destructive-foreground ring-2 ring-primary">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar, mobile only, below the main row */}
        <div className="flex justify-center border-t border-primary-light/30 px-4 py-2 sm:hidden">
          <SearchBar />
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-muted">
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
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Social media"
                  className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                >
                  <Share2Icon className="size-4" />
                </a>
                <Link
                  to="/contact"
                  aria-label="Contact us"
                  className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                >
                  <PhoneIcon className="size-4" />
                </Link>
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
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/search"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
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
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
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
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <Link
                    to="/returns"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Our Services
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
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
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Left Column: Client Info & Location */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Jaaziel Trading Enterprise. All rights reserved.
              </p>
              <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden="true">|</span>
              <p className="text-sm text-muted-foreground">
                Accra, Ghana
              </p>
            </div>

            {/* Right Column: Developer Attribution with SEO Protection */}
            <p className="text-sm text-muted-foreground">
              Built by{" "}
              <a
                href="https://samuel-dorkey.vercel.app/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-medium text-foreground transition-colors hover:text-primary underline decoration-muted-foreground/30 underline-offset-4 hover:decoration-foreground"
              >
                Sloane Dev
              </a>
            </p>
          </div>
        </div>
      </footer>

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        container={themeContainerRef.current}
      />
    </div>
  );
}