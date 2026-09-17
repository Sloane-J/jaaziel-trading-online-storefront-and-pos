import {
  FileTextIcon,
  HomeIcon,
  MessageCircleIcon,
  SmartphoneIcon,
} from "lucide-react";
import { Link } from "react-router";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { useDocumentTitle } from "@/lib/use-document-title";

const WHATSAPP_NUMBER = "233XXXXXXXXX"; // replace with the real number used elsewhere

function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function ServiceCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof HomeIcon;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary-light text-primary-light-foreground">
        <Icon className="size-6" />
      </div>
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function ServicesPage() {
  useDocumentTitle("Services");

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Our Services
          </h1>
          <p className="mt-2 text-muted-foreground">
            Beyond our shop, we offer a few additional services to our
            community.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            icon={HomeIcon}
            title="Land & Property"
            description="Buying, selling, or renting land, houses, and apartments. Browse our current listings and get in touch."
            action={
              <Link
                to="/shop/land-property"
                className="mt-auto inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 hover:bg-primary/90"
              >
                Browse listings
              </Link>
            }
          />

          <ServiceCard
            icon={FileTextIcon}
            title="Property Documentation"
            description="Assistance with paperwork and documentation for land, houses, and cars. We help you get it right."
            action={
              <a
                href={whatsappLink(
                  "Hi, I'd like help with property documentation.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 hover:bg-primary/90"
              >
                <MessageCircleIcon className="size-4" />
                Chat with us
              </a>
            }
          />

          <ServiceCard
            icon={SmartphoneIcon}
            title="Mobile Money Services"
            description="Cash-in, cash-out, and transfer services available in-store. Visit us or reach out for details."
            action={
              <a
                href={whatsappLink(
                  "Hi, I'd like to know more about your Mobile Money services.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 hover:bg-primary/90"
              >
                <MessageCircleIcon className="size-4" />
                Chat with us
              </a>
            }
          />
        </div>
      </div>
    </StorefrontLayout>
  );
}