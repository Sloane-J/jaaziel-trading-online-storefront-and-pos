import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BanknoteIcon,
  CameraIcon,
  CheckCircle2Icon,
  Clock3Icon,
  HomeIcon,
  MessageCircleIcon,
  PhoneCallIcon,
  QuoteIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { Button } from "@/components/ui/button";
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
import { uploadPropertySubmissionImage } from "@/lib/api/uploads";
import { useDocumentTitle } from "@/lib/use-document-title";

const WHATSAPP_NUMBER = "233XXXXXXXXX"; // matches the number used elsewhere

function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const PROPERTY_TYPES = ["Land", "House", "Apartment", "Car", "Other"];

/* ---------------------------------- */
/* Micro-animation utilities (no deps) */
/* ---------------------------------- */

function useInView<T extends HTMLElement>(threshold = 0.15) {
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
        transform: inView ? "none" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- */
/* Benefits / steps data               */
/* ---------------------------------- */

const BENEFITS = [
  {
    icon: BanknoteIcon,
    title: "Free to list",
    text: "No upfront fees. You only pay a small commission when your property actually sells.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Verified buyers only",
    text: "We screen enquiries so you only speak to serious, genuine buyers.",
  },
  {
    icon: TrendingUpIcon,
    title: "Fair price guidance",
    text: "We know the local market and help you price right — not too low, not too high.",
  },
  {
    icon: PhoneCallIcon,
    title: "We handle the calls",
    text: "No spam, no strangers at your door. We manage every enquiry for you.",
  },
];

const STEPS = [
  { title: "Tell us about it", text: "Fill in the form below — takes under 2 minutes." },
  { title: "We review & list", text: "We verify details, polish the listing, and publish it." },
  { title: "Buyers come to you", text: "We connect you with serious buyers and close the deal." },
];

export function ListPropertyPage() {
  useDocumentTitle("List Your Property");

  const [submitterName, setSubmitterName] = useState("");
  const [submitterPhone, setSubmitterPhone] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const createSubmission = useCreatePropertySubmission();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submitterName.trim() || !submitterPhone.trim() || !propertyType || !description.trim()) {
      return;
    }

    try {
      await createSubmission.mutateAsync({
        submitterName: submitterName.trim(),
        submitterPhone: submitterPhone.trim(),
        propertyType,
        description: description.trim(),
        images,
      });
      setSubmitted(true);
    } catch {
      // error surfaced via createSubmission.isError below
    }
  }

  function handleReset() {
    setSubmitterName("");
    setSubmitterPhone("");
    setPropertyType("");
    setDescription("");
    setImages([]);
    setSubmitted(false);
  }

  /* ------------ SUCCESS SCREEN ------------ */
  if (submitted) {
    return (
      <StorefrontLayout>
        <style>{`
          @keyframes kf-pop { 0% { transform: scale(0); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
          .k-pop { animation: kf-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
          @keyframes kf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
          .k-float { animation: kf-float 5.5s ease-in-out infinite; }
        `}</style>

        <section className="relative overflow-hidden bg-primary px-6 py-16 sm:py-20">
          <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[#ff6b4a]/20 blur-3xl k-float" />
          <div className="absolute -left-24 bottom-0 size-80 rounded-full bg-primary-light/15 blur-3xl k-float" />
          <div className="relative mx-auto max-w-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff6b4a]">
              All done
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold text-primary-foreground sm:text-4xl">
              Your property is on its way to buyers.
            </h1>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-10 max-w-lg px-6 pb-24">
          <div className="rounded-[2rem] bg-card p-10 text-center shadow-xl ring-1 ring-border">
            <div className="k-pop mx-auto flex size-20 items-center justify-center rounded-full bg-success/10 ring-8 ring-success/10">
              <CheckCircle2Icon className="size-10 text-success" />
            </div>

            <p className="mt-6 font-heading text-xl font-bold text-foreground">
              Submission received
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Thank you, {submitterName.split(" ")[0] || "friend"}! We'll review
              your {propertyType.toLowerCase() || "property"} details and reach
              out on <span className="font-semibold text-foreground">{submitterPhone}</span>{" "}
              within 24 hours.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-primary/5 px-4 py-3 text-xs text-muted-foreground ring-1 ring-primary/10">
              <Clock3Icon className="size-4 shrink-0 text-primary" />
              Most listings go live within 1–2 business days.
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 rounded-full border-primary text-primary hover:bg-primary/5"
              >
                List another property
              </Button>
              <Button
                asChild
                className="flex-1 rounded-full bg-[#ff6b4a] text-white hover:bg-[#ff6b4a]/90"
              >
                <a
                  href={whatsappLink(`Hi, I just submitted my ${propertyType} for listing. Can we chat?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircleIcon className="size-4" />
                  Chat with us
                </a>
              </Button>
            </div>
          </div>
        </section>
      </StorefrontLayout>
    );
  }

  /* ------------ MAIN FORM PAGE ------------ */
  return (
    <StorefrontLayout>
      <style>{`
        @keyframes kf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .k-float { animation: kf-float 5.5s ease-in-out infinite; }
        .k-float-delayed { animation: kf-float 6.5s ease-in-out 1.4s infinite; }
        @keyframes kf-blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(28px, -32px) scale(1.1); } 66% { transform: translate(-18px, 18px) scale(0.94); } }
        .k-blob { animation: kf-blob 16s ease-in-out infinite; }
      `}</style>

      {/* ============ HEADER ============ */}
      <section className="relative overflow-hidden bg-primary">
        <img
          src="/images/services/property-2.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/90 to-primary" />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#ff6b4a]/25 blur-3xl k-blob" />

        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 ring-1 ring-white/20 backdrop-blur">
              <SparklesIcon className="size-3.5 text-[#ff6b4a]" />
              <span className="text-xs font-semibold tracking-wide text-primary-light">
                Free to list · No obligation
              </span>
            </div>

            <h1 className="mt-5 font-heading text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl">
              Sell faster.{" "}
              <span className="relative inline-block">
                <span className="relative z-10">List for free.</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 rounded-sm bg-[#ff6b4a]/70" />
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg text-primary-foreground/85">
              Selling or renting land, a house, an apartment, or a car? Tell us
              about it — we'll handle the hard part of finding the right buyer.
            </p>

            {/* mini steps */}
            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="relative rounded-2xl bg-white/8 p-5 text-left ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/12"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#ff6b4a] font-heading text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-primary-foreground">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-primary-foreground/70">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ BODY ============ */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Left: benefits panel */}
          <Reveal className="lg:col-span-2">
            <div className="space-y-8 lg:sticky lg:top-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#ff6b4a]">
                  Why list with us
                </p>
                <h2 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  The easiest way to sell in your neighbourhood
                </h2>
              </div>

              <div className="space-y-4">
                {BENEFITS.map((b, i) => (
                  <Reveal key={b.title} delay={i * 100}>
                    <div className="group flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        <b.icon className="size-5" />
                      </span>
                      <div>
                        <p className="font-heading text-sm font-semibold text-foreground">
                          {b.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {b.text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* testimonial card */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl shadow-lg">
                  <img
                    src="/images/services/keys.jpg"
                    alt="Handing over house keys to a happy new owner"
                    loading="lazy"
                    className="aspect-4/3 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4">
                    <QuoteIcon className="size-5 text-[#ff6b4a]" />
                    <p className="mt-1 font-heading text-sm font-medium leading-snug text-primary-foreground">
                      "Listed on Monday, sold by Friday. These people know what
                      they're doing."
                    </p>
                    <p className="mt-1.5 text-xs text-primary-foreground/70">
                      — Kwame M., Tema
                    </p>
                  </div>
                </div>

                {/* floating chip */}
                <div className="absolute -right-3 -top-4 flex items-center gap-2.5 rounded-2xl bg-card px-4 py-2.5 shadow-lg ring-1 ring-border k-float sm:-right-5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#ff6b4a]/10 text-[#ff6b4a]">
                    <BadgeCheckIcon className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Avg. time to sell</p>
                    <p className="text-[11px] text-muted-foreground">3–6 weeks</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: form card */}
          <Reveal delay={120} className="lg:col-span-3">
            <div className="relative">
              {/* decorative offset frame */}
              <div className="absolute -inset-2.5 rotate-1 rounded-[2.2rem] border-2 border-primary/10" aria-hidden />

              <div className="relative rounded-[2rem] bg-card p-7 shadow-xl ring-1 ring-border sm:p-10">
                <div className="mb-8 flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <HomeIcon className="size-6" />
                  </span>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                      Tell us about your property
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The more detail you share, the faster we can match you
                      with the right buyer.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* section: your details */}
                  <div className="space-y-5">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                      <span className="h-px w-6 bg-primary/30" />
                      Your details
                    </p>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="submitter-name">Your name</Label>
                        <Input
                          id="submitter-name"
                          value={submitterName}
                          onChange={(e) => setSubmitterName(e.target.value)}
                          placeholder="e.g. Kwame Mensah"
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="submitter-phone">Phone number</Label>
                        <Input
                          id="submitter-phone"
                          type="tel"
                          value={submitterPhone}
                          onChange={(e) => setSubmitterPhone(e.target.value)}
                          placeholder="e.g. 0244123456"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* section: property details */}
                  <div className="space-y-5">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                      <span className="h-px w-6 bg-primary/30" />
                      Property details
                    </p>

                    <div className="space-y-2">
                      <Label htmlFor="property-type">Property type</Label>
                      <Select value={propertyType} onValueChange={(value) => setPropertyType(value ?? "")}>
                        <SelectTrigger id="property-type" className="rounded-xl">
                          <SelectValue placeholder="Choose a type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Location, size, price expectations, and any other details."
                        rows={5}
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tip: mention the area (e.g. Spintex, East Legon), land
                        size or bedrooms, and your asking price.
                      </p>
                    </div>
                  </div>

                  {/* section: photos */}
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                      <span className="h-px w-6 bg-primary/30" />
                      Photos
                      <span className="font-normal normal-case tracking-normal text-muted-foreground">
                        (optional, up to 5)
                      </span>
                    </p>

                    <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-4 transition-colors hover:border-primary/35">
                      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <CameraIcon className="size-4 text-primary" />
                        Good photos can double your enquiries.
                      </div>
                      <ImageUpload
                        images={images}
                        onChange={setImages}
                        maxImages={5}
                        uploadFn={uploadPropertySubmissionImage}
                      />
                    </div>
                  </div>

                  {createSubmission.isError && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
                    >
                      <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <p className="text-sm text-destructive">
                        {createSubmission.error instanceof Error
                          ? createSubmission.error.message
                          : "Something went wrong. Please try again."}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={createSubmission.isPending}
                    className="group w-full rounded-full bg-primary py-6 text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                  >
                    {createSubmission.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit for review
                        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    No spam, no obligation. We'll only call about your listing.
                  </p>
                </form>
              </div>

              {/* floating chip on form card */}
              <div className="absolute -top-5 right-6 hidden items-center gap-2.5 rounded-2xl bg-card px-4 py-2.5 shadow-lg ring-1 ring-border k-float-delayed sm:flex">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                  <MessageCircleIcon className="size-4.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">Prefer to chat?</p>
                  <a
                    href={whatsappLink("Hi, I'd like to list my property with you.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Message us on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </StorefrontLayout>
  );
}