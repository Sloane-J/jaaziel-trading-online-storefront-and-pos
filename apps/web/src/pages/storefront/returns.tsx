import {
  MessageCircleQuestionIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  TimerIcon,
} from "lucide-react";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { ReturnRequestForm } from "@/features/storefront/components/return-request-form";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/lib/use-document-title";

const TRUST_POINTS = [
  {
    icon: TimerIcon,
    title: "Reviewed within 24 hours",
    description: "We respond to every request the same or next business day.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Refund to original payment",
    description: "Money goes back to the card or mobile money you paid with.",
  },
  {
    icon: RotateCcwIcon,
    title: "No restocking fees",
    description: "If something's wrong with your order, returning it costs nothing.",
  },
];

export function ReturnsPage() {
  useDocumentTitle("Returns & Refunds");

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Hero */}
        <header className="mb-8 text-center sm:mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light/10 px-3 py-1 text-xs font-medium text-primary animate-in fade-in zoom-in-95">
            <RotateCcwIcon className="size-3.5" />
            Easy returns
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Changed your mind?
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground sm:text-base">
            Send it back in a few quick steps. Find your order, pick the items, and we'll handle
            the rest. Refunds go straight to your original payment method.
          </p>
        </header>

        {/* Form card */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm shadow-primary/5 sm:p-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <ReturnRequestForm />
        </div>

        {/* Trust points */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {TRUST_POINTS.map((point, i) => (
            <div
              key={point.title}
              className="rounded-2xl border border-border bg-muted/40 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-3"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <point.icon className="size-5 text-primary" />
              <p className="mt-2 text-sm font-medium text-foreground">{point.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Help strip */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <MessageCircleQuestionIcon className="size-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Can't find your order code or need a hand?{" "}
              <span className="font-medium text-foreground">We're happy to help.</span>
            </p>
          </div>
          <Button variant="outline" className="rounded-full" asChild>
            <a href="/contact">Contact support</a>
          </Button>
        </div>
      </div>
    </StorefrontLayout>
  );
}