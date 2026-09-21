import {
  ArrowRightIcon,
  CameraIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  Clock3Icon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneCallIcon,
  QuoteIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/features/admin/components/image-upload";
import { useCreatePropertySubmission } from "@/features/storefront/hooks/use-property-submissions";
import { usePublicCategories } from "@/features/storefront/hooks/use-storefront";
import { uploadPropertySubmissionImage } from "@/lib/api/uploads";
import { useDocumentTitle } from "@/lib/use-document-title";

const WHATSAPP_NUMBER = "233XXXXXXXXX"; // matches the number used elsewhere

function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ---------------------------------- */
/* Subtle scroll-reveal (no deps)      */
/* ---------------------------------- */

function useInView<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(16px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- */
/* Content data                        */
/* ---------------------------------- */

const FORM_STEPS = [
  { label: "Your details" },
  { label: "The property" },
  { label: "Photos" },
  { label: "Submit" },
];

const NEXT_STEPS = [
  {
    title: "We review your submission",
    text: "Usually the same day. We may call to confirm a few details.",
  },
  {
    title: "Your listing goes live",
    text: "We tidy up the wording, add your photos, and publish it.",
  },
  {
    title: "Buyers reach out",
    text: "We screen every enquiry and only pass on serious buyers.",
  },
];

export function ListPropertyPage() {
  useDocumentTitle("List Your Property");

  const { data: categories } = usePublicCategories();
  const inquiryCategories = (categories ?? []).filter((c) => c.isInquiryOnly);

  const [submitterName, setSubmitterName] = useState("");
  const [submitterPhone, setSubmitterPhone] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubmission = useCreatePropertySubmission();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !submitterName.trim() ||
      !submitterPhone.trim() ||
      !categoryId ||
      !title.trim() ||
      !description.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await createSubmission.mutateAsync({
        submitterName: submitterName.trim(),
        submitterPhone: submitterPhone.trim(),
        categoryId,
        title: title.trim(),
        description: description.trim(),
        images,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  function handleReset() {
    setSubmitterName("");
    setSubmitterPhone("");
    setCategoryId("");
    setTitle("");
    setDescription("");
    setImages([]);
    setError(null);
    setSubmitted(false);
  }

  /* ------------ SUCCESS SCREEN ------------ */
  if (submitted) {
    return (
      <StorefrontLayout>
        <style>{`
          @keyframes kf-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          .k-pop { animation: kf-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
        `}</style>

        <div className="bg-[#f7f3ec]/60">
          <div className="mx-auto max-w-xl px-6 py-16 sm:py-24">
            <div className="k-pop rounded-md bg-card p-8 shadow-sm ring-1 ring-border sm:p-12">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2Icon className="size-8 text-success" />
              </div>

              <h1 className="mt-6 text-center font-heading text-2xl font-bold text-foreground sm:text-3xl">
                Submission received
              </h1>
              <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
                Thank you, {submitterName.split(" ")[0] || "friend"}. We'll review
                your listing, <span className="font-medium text-foreground">"{title}"</span>,
                and reach you on{" "}
                <span className="font-medium text-foreground">{submitterPhone}</span>{" "}
                within 24 hours.
              </p>

              <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  What happens next
                </p>
                <ol className="mt-4 space-y-4">
                  {NEXT_STEPS.map((step, i) => (
                    <li key={step.title} className="flex gap-3.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{step.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  List another property
                </Button>
                <a
                  href={whatsappLink(`Hi, I just submitted a listing: "${title}". Can we chat?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    className: "flex-1 rounded-full bg-[#25D366] text-white hover:bg-[#25D366]/90",
                  })}
                >
                  <MessageCircleIcon className="size-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Mon–Sat, 8:00am – 6:00pm · We usually respond within the hour
            </p>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  /* ------------ MAIN FORM PAGE ------------ */
  return (
    <StorefrontLayout>
      {/* ============ PAGE HEADER ============ */}
      <header className="relative overflow-hidden bg-primary">
        <img
          src="/images/services/property-2.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />

        <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <Reveal>
            {/* breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-primary-foreground/70">
              <a href="/" className="transition-colors hover:text-primary-foreground">
                Home
              </a>
              <ChevronRightIcon className="size-3" />
              <a href="/services" className="transition-colors hover:text-primary-foreground">
                Services
              </a>
              <ChevronRightIcon className="size-3" />
              <span className="font-medium text-primary-foreground">List your property</span>
            </nav>

            <h1 className="mt-5 max-w-xl font-heading text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl">
              List your property
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
              Selling or renting land, a house, an apartment, or a car? Tell us
              about it below. It takes about two minutes, and there's nothing
              to pay unless we find you a buyer.
            </p>
          </Reveal>
        </div>
      </header>

      {/* ============ STEP INDICATOR ============ */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl overflow-x-auto px-6">
          <ol className="flex min-w-max items-center gap-2 py-4">
            {FORM_STEPS.map((step, i) => (
              <li key={step.label} className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary font-heading text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-xs font-medium text-foreground sm:text-sm">
                  {step.label}
                </span>
                {i < FORM_STEPS.length - 1 && (
                  <span className="mx-3 h-px w-8 bg-border sm:w-14" aria-hidden />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ============ BODY ============ */}
      <main className="bg-[#f7f3ec]/60">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* -------- Form -------- */}
            <Reveal className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-md bg-card p-6 shadow-sm ring-1 ring-border sm:p-10"
              >
                {/* Section 1: contact */}
                <fieldset>
                  <legend className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
                      1
                    </span>
                    Your contact details
                  </legend>

                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="submitter-name">
                        Your name <span className="text-[#ff6b4a]">*</span>
                      </Label>
                      <Input
                        id="submitter-name"
                        value={submitterName}
                        onChange={(e) => setSubmitterName(e.target.value)}
                        placeholder="e.g. Kwame Mensah"
                        className="rounded-md bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="submitter-phone">
                        Phone number <span className="text-[#ff6b4a]">*</span>
                      </Label>
                      <Input
                        id="submitter-phone"
                        type="tel"
                        value={submitterPhone}
                        onChange={(e) => setSubmitterPhone(e.target.value)}
                        placeholder="e.g. 0244123456"
                        className="rounded-md bg-background"
                      />
                    </div>
                  </div>
                </fieldset>

                <div className="my-8 border-t border-border" />

                {/* Section 2: property */}
                <fieldset>
                  <legend className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
                      2
                    </span>
                    About the property
                  </legend>

                  <div className="mt-5 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Category <span className="text-[#ff6b4a]">*</span>
                      </Label>
                      <Select
                        value={categoryId}
                        onValueChange={(value) => setCategoryId(value ?? "")}
                      >
                        <SelectTrigger id="category" className="rounded-md bg-background">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryCategories.length === 0 ? (
                            <SelectItem value="__loading" disabled>
                              Loading categories…
                            </SelectItem>
                          ) : (
                            inquiryCategories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Listing title <span className="text-[#ff6b4a]">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. 3-Bedroom House in East Legon"
                        className="rounded-md bg-background"
                      />
                      <p className="text-xs text-muted-foreground">
                        A clear title helps buyers find your listing faster.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description <span className="text-[#ff6b4a]">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Location, size, price expectations, and any other details."
                        rows={5}
                        className="rounded-md bg-background"
                      />
                      <p className="text-xs text-muted-foreground">
                        Mention the area, land size or number of bedrooms, and
                        your asking price.
                      </p>
                    </div>
                  </div>
                </fieldset>

                <div className="my-8 border-t border-border" />

                {/* Section 3: photos */}
                <fieldset>
                  <legend className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
                      3
                    </span>
                    Photos
                    <span className="text-xs font-normal text-muted-foreground">
                      (optional, up to 5)
                    </span>
                  </legend>

                  <div className="mt-5 rounded-2xl border-2 border-dashed border-border bg-background/60 p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <CameraIcon className="size-4 text-primary" />
                      Listings with photos get noticeably more enquiries.
                    </div>
                    <ImageUpload
                      images={images}
                      onChange={setImages}
                      maxImages={5}
                      uploadFn={uploadPropertySubmissionImage}
                    />
                  </div>
                </fieldset>

                {/* errors */}
                {(error || createSubmission.isError) && (
                  <div
                    role="alert"
                    className="mt-6 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3"
                  >
                    <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-destrucenvtive" />
                    <div className="space-y-1">
                      {error && <p className="text-sm text-destructive">{error}</p>}
                      {createSubmission.isError && (
                        <p className="text-sm text-destructive">
                          {createSubmission.error instanceof Error
                            ? createSubmission.error.message
                            : "Something went wrong. Please try again."}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* submit */}
                <div className="mt-8">
                  <Button
                    type="submit"
                    disabled={createSubmission.isPending}
                    className="group w-full rounded-full bg-primary py-6 text-sm font-semibold shadow-sm transition-all hover:bg-primary/95 hover:shadow-md active:scale-[0.99] sm:w-auto sm:px-10"
                  >
                    {createSubmission.isPending ? (
                      "Submitting…"
                    ) : (
                      <>
                        Submit for review
                        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Nothing is published until we've spoken with you first.
                  </p>
                </div>
              </form>
            </Reveal>

            {/* -------- Sidebar -------- */}
            <div className="space-y-6">
              {/* what happens next */}
              <Reveal delay={80}>
                <aside className="rounded-md bg-card p-6 shadow-sm ring-1 ring-border sm:p-7">
                  <h2 className="font-heading text-base font-bold text-foreground">
                    What happens next
                  </h2>
                  <ol className="mt-5 space-y-5">
                    {NEXT_STEPS.map((step, i) => (
                      <li key={step.title} className="relative flex gap-3.5">
                        {i < NEXT_STEPS.length - 1 && (
                          <span
                            className="absolute left-3.5 top-8 h-[calc(100%-1.5rem)] w-px bg-border"
                            aria-hidden
                          />
                        )}
                        <span className="z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{step.title}</p>
                          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                            {step.text}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </aside>
              </Reveal>

              {/* photo + testimonial */}
              <Reveal delay={140}>
                <figure className="overflow-hidden rounded-md shadow-sm ring-1 ring-border">
                  <img
                    src="/images/services/consult.jpg"
                    alt="A member of our team talking through documents with a client"
                    loading="lazy"
                    className="aspect-16/10 w-full object-cover"
                  />
                  <figcaption className="bg-card p-5">
                    <QuoteIcon className="size-4 text-[#ff6b4a]" />
                    <blockquote className="mt-2 text-sm leading-relaxed text-foreground">
                      "Listed on Monday, sold by Friday. They handled every
                      call and only sent serious buyers my way."
                    </blockquote>
                    <p className="mt-2 text-xs text-muted-foreground">
                      — Kwame M., Tema
                    </p>
                  </figcaption>
                </figure>
              </Reveal>

              {/* contact card */}
              <Reveal delay={200}>
                <aside className="rounded-md bg-primary p-6 text-primary-foreground sm:p-7">
                  <h2 className="font-heading text-base font-bold">
                    Prefer to talk first?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
                    Call or message us before you submit — we're happy to
                    answer questions about pricing or the process.
                  </p>

                  <a
                    href={whatsappLink("Hi, I'd like to list my property with you.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      className: "mt-5 w-full rounded-full bg-[#25D366] text-white hover:bg-[#25D366]/90",
                    })}
                  >
                    <MessageCircleIcon className="size-4" />
                    Message on WhatsApp
                  </a>

                  <ul className="mt-5 space-y-2.5 border-t border-white/15 pt-5 text-sm text-primary-foreground/80">
                    <li className="flex items-center gap-2.5">
                      <PhoneCallIcon className="size-4 shrink-0 text-primary-light" />
                      <a
                        href={`tel:+${WHATSAPP_NUMBER}`}
                        className="transition-colors hover:text-primary-foreground"
                      >
                        +{WHATSAPP_NUMBER}
                      </a>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock3Icon className="size-4 shrink-0 text-primary-light" />
                      Mon–Sat · 8:00am – 6:00pm
                    </li>
                    <li className="flex items-center gap-2.5">
                      <MapPinIcon className="size-4 shrink-0 text-primary-light" />
                      Visit us in-store for a face-to-face chat
                    </li>
                  </ul>
                </aside>
              </Reveal>
            </div>
          </div>
        </div>
      </main>
    </StorefrontLayout>
  );
}