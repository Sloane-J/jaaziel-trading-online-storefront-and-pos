import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BanknoteIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  Clock3Icon,
  FileTextIcon,
  HandshakeIcon,
  HomeIcon,
  MapPinIcon,
  MessageCircleIcon,
  QuoteIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { useDocumentTitle } from "@/lib/use-document-title";

const WHATSAPP_NUMBER = "233XXXXXXXXX"; // matches the number used elsewhere

function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

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

function Counter({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1600;
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------------------------------- */
/* Service section (same props as before, optional extras added) */
/* ---------------------------------- */

type ServiceSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  imageQuery: string;
  imageAlt: string;
  reverse?: boolean;
  cta: React.ReactNode;
  icon: typeof HomeIcon;
  chip?: { icon: typeof HomeIcon; label: string; sub: string };
};

function ServiceSection({
  eyebrow,
  title,
  description,
  bullets,
  imageQuery,
  imageAlt,
  reverse = false,
  cta,
  icon: Icon,
  chip,
}: ServiceSectionProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* soft decorative blob */}
      <div
        className={`pointer-events-none absolute top-1/3 size-72 rounded-full bg-primary/5 blur-3xl ${
          reverse ? "-right-20" : "-left-20"
        }`}
      />

      <div
        className={`relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20 ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Image side */}
        <Reveal>
          <div className="group relative">
            {/* offset outline frame */}
            <div
              className={`absolute -inset-3 rounded-[2rem] border-2 border-primary/15 ${
                reverse ? "-rotate-2" : "rotate-2"
              } transition-transform duration-500 group-hover:rotate-0`}
            />
            <div className="relative overflow-hidden rounded-[2rem] shadow-xl">
              <img
                src={imageQuery}
                alt={imageAlt}
                loading="lazy"
                className="aspect-4/3 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-60" />
            </div>

            {/* floating chip card */}
            {chip && (
              <div
                className={`absolute -bottom-6 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-lg ring-1 ring-border ${
                  reverse ? "-left-3 sm:-left-8" : "-right-3 sm:-right-8"
                } k-float`}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[#ff6b4a]/10 text-[#ff6b4a]">
                  <chip.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{chip.label}</p>
                  <p className="text-xs text-muted-foreground">{chip.sub}</p>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Content side */}
        <Reveal delay={120}>
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-primary/8 px-4 py-1.5 ring-1 ring-primary/15">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-4" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {eyebrow}
              </p>
            </div>

            <h2 className="font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {title}
            </h2>

            <p className="leading-relaxed text-muted-foreground">{description}</p>

            <ul className="space-y-3">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <CheckCircle2Icon className="mt-0.5 size-4.5 shrink-0 text-[#ff6b4a]" />
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="pt-3">{cta}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------- */
/* FAQ accordion                       */
/* ---------------------------------- */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        open
          ? "border-primary/30 bg-card shadow-md"
          : "border-border bg-card/60 hover:border-primary/20"
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-heading text-sm font-semibold text-foreground sm:text-base">
          {q}
        </span>
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          <ChevronDownIcon
            className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Testimonials carousel               */
/* ---------------------------------- */

const TESTIMONIALS = [
  {
    name: "Ama Sarpong",
    role: "Homeowner, East Legon",
    quote:
      "They handled my land registration from start to finish. What would have taken me months of back-and-forth was done in weeks — with every document explained in plain language.",
    initials: "AS",
  },
  {
    name: "Kwame Mensah",
    role: "Property Seller, Tema",
    quote:
      "I listed my house with them and had serious buyers within two weeks. No hidden fees, no pressure — just honest advice and regular updates on WhatsApp.",
    initials: "KM",
  },
  {
    name: "Efua Darko",
    role: "Shop Owner, Madina",
    quote:
      "Their mobile money service is my go-to every single week. Fast, reliable, and they actually greet you by name. It feels like doing business with family.",
    initials: "ED",
  },
  {
    name: "Yaw Owusu",
    role: "First-time Buyer, Spintex",
    quote:
      "As a first-time buyer I was terrified of being duped. They verified everything, walked me through the paperwork, and made sure I got a fair deal. Forever grateful.",
    initials: "YO",
  },
];

function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % TESTIMONIALS.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[index];

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-[2rem] bg-card p-8 shadow-xl ring-1 ring-border sm:p-12">
        <QuoteIcon className="absolute -top-2 right-8 size-24 text-primary/8" />

        <div key={index} className="relative">
          <div className="flex gap-1 text-[#ff6b4a]">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="size-4 fill-current" />
            ))}
          </div>

          <blockquote className="mt-5 font-heading text-lg leading-relaxed text-foreground sm:text-xl">
            “{t.quote}”
          </blockquote>

          <div className="mt-7 flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
              {t.initials}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="mt-6 flex justify-center gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Floating WhatsApp button            */
/* ---------------------------------- */

function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink("Hi, I need help with one of your services.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-0 rounded-full bg-[#25D366] p-4 text-white shadow-xl transition-all duration-300 hover:pr-6 hover:shadow-2xl active:scale-95"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] k-ring" aria-hidden />
      <MessageCircleIcon className="relative size-6" />
      <span className="relative max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap transition-all duration-300 group-hover:ml-2 group-hover:max-w-40">
        Chat with us
      </span>
    </a>
  );
}

/* ---------------------------------- */
/* Page                                */
/* ---------------------------------- */

const MARQUEE_ITEMS = [
  "Land & Property",
  "Property Documentation",
  "Mobile Money",
  "Verified Listings",
  "Trusted Since Day One",
  "Greater Accra & Beyond",
];

const STATS = [
  { value: 340, suffix: "+", label: "Properties connected", icon: HomeIcon },
  { value: 1150, suffix: "+", label: "Documents processed", icon: FileTextIcon },
  { value: 2, prefix: "GHS ", suffix: "M+", label: "MoMo transactions", icon: BanknoteIcon },
  { value: 8, suffix: "+", label: "Years serving Accra", icon: Clock3Icon },
];

const PROCESS_STEPS = [
  {
    icon: MessageCircleIcon,
    title: "Reach out",
    text: "Send us a message on WhatsApp or visit the shop. Tell us what you need in your own words.",
  },
  {
    icon: UsersIcon,
    title: "We assess & advise",
    text: "We review your situation, explain your options clearly, and give you an honest cost estimate.",
  },
  {
    icon: FileTextIcon,
    title: "We handle the process",
    text: "From paperwork to listings to transfers — we do the heavy lifting and keep you updated.",
  },
  {
    icon: SparklesIcon,
    title: "You relax",
    text: "Collect your keys, documents, or receipts — with after-service support whenever you need it.",
  },
];

const WHY_US = [
  {
    icon: MapPinIcon,
    title: "Deep local knowledge",
    text: "Born and raised here — we know the neighbourhoods, the prices, and the people.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Verified & transparent",
    text: "Every listing and document is checked. No surprises, no hidden charges, ever.",
  },
  {
    icon: Clock3Icon,
    title: "Fast turnaround",
    text: "We respect your time. Most requests get a same-day response, often within the hour.",
  },
  {
    icon: HandshakeIcon,
    title: "One trusted contact",
    text: "Property, paperwork, and payments — handle it all with one team that knows you.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Beginner-friendly",
    text: "First time buying land or registering documents? We explain everything step by step.",
  },
  {
    icon: TrendingUpIcon,
    title: "Fair honest pricing",
    text: "Rates that make sense for real people. Quality service shouldn't cost a fortune.",
  },
];

const FAQS = [
  {
    q: "How do I list my property with you?",
    a: "Simply click 'List your property' and fill in the details, or message us on WhatsApp. We'll review your listing, arrange photos if needed, and publish it — completely free to submit.",
  },
  {
    q: "Do you charge for property documentation help?",
    a: "We always start with a free consultation. Once we understand what you need, we give you a clear written estimate before any work begins — no hidden fees, no surprises.",
  },
  {
    q: "Which mobile money networks do you support?",
    a: "We support all major networks including MTN MoMo, Telecel Cash, and AirtelTigo Money — for cash-in, cash-out, and transfers.",
  },
  {
    q: "I'm a first-time buyer. Can you really guide me through everything?",
    a: "Absolutely — first-time buyers are our favourite people to help. We'll explain each document, flag anything suspicious, and make sure you never sign anything you don't fully understand.",
  },
  {
    q: "How long does property paperwork usually take?",
    a: "It depends on the document, but most processes we handle are completed in 2–6 weeks. We'll give you a realistic timeline upfront and update you at every stage.",
  },
];

export function ServicesPage() {
  useDocumentTitle("Services");

  return (
    <StorefrontLayout>
      <style>{`
        @keyframes kf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .k-float { animation: kf-float 5.5s ease-in-out infinite; }
        .k-float-delayed { animation: kf-float 6.5s ease-in-out 1.4s infinite; }
        @keyframes kf-blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(28px, -32px) scale(1.1); } 66% { transform: translate(-18px, 18px) scale(0.94); } }
        .k-blob { animation: kf-blob 16s ease-in-out infinite; }
        @keyframes kf-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .k-marquee { animation: kf-marquee 30s linear infinite; }
        @keyframes kf-ring { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.85); opacity: 0; } }
        .k-ring { animation: kf-ring 2.2s ease-out infinite; }
      `}</style>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-primary">
        <img
          src="/images/services/hero-accra.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/70 to-primary" />
        {/* animated blobs */}
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#ff6b4a]/25 blur-3xl k-blob" />
        <div className="absolute -left-32 bottom-0 size-80 rounded-full bg-primary-light/20 blur-3xl k-blob" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-20 sm:py-28 lg:grid-cols-2">
          {/* Left copy */}
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 ring-1 ring-white/20 backdrop-blur">
              <span className="text-xs font-semibold tracking-wide text-white">
                Services You Can Trust
              </span>
            </div>

            <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.1] text-primary-foreground sm:text-5xl lg:text-6xl">
              Everything your property &amp; money need,{" "}
              <span className="relative inline-block">
                <span className="relative z-10">under one roof.</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 rounded-sm bg-[#ff6b4a]/70" />
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-primary-foreground/85">
              From finding your next home to registering your land and moving
              money in minutes — we're the team your neighbourhood has trusted
              for years, now easier to reach than ever.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/shop/land-property"
                className="group inline-flex items-center gap-2 rounded-full bg-[#ff6b4a] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
              >
                Browse properties
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={whatsappLink("Hi, I'd like to know more about your services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 active:scale-95"
              >
                <MessageCircleIcon className="size-4" />
                Chat with us
              </a>
            </div>

            {/* trust row */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {["AS", "KM", "ED", "YO"].map((i) => (
                  <span
                    key={i}
                    className="flex size-9 items-center justify-center rounded-full bg-primary-light text-[10px] font-bold text-primary ring-2 ring-primary"
                  >
                    {i}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-[#ff6b4a]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="size-3.5 fill-current" />
                  ))}
                  <span className="ml-1.5 text-sm font-semibold text-primary-foreground">4.9</span>
                </div>
                <p className="text-xs text-primary-foreground/70">
                  from 200+ happy customers
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right visual */}
          <Reveal delay={150}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rotate-2 overflow-hidden rounded-[2rem] shadow-2xl transition-transform duration-700 hover:rotate-0">
                <img
                  src="/images/services/property-1.jpg"
                  alt="A beautiful modern home at sunset"
                  className="aspect-4/3 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
              </div>

              {/* floating card: listing verified */}
              <div className="absolute -left-4 -top-5 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-xl ring-1 ring-border k-float sm:-left-8">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BadgeCheckIcon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">Listing verified</p>
                  <p className="text-[11px] text-muted-foreground">2-bed apartment · Spintex</p>
                </div>
              </div>

              {/* floating card: MoMo */}
              <div className="absolute -bottom-6 -right-3 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-xl ring-1 ring-border k-float-delayed sm:-right-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                  <BanknoteIcon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">MoMo cash-out</p>
                  <p className="text-[11px] text-muted-foreground">GHS 1,500 · Completed ✓</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-6">
        <Reveal>
          <div className="grid grid-cols-2 gap-y-8 rounded-3xl bg-card p-8 shadow-xl ring-1 ring-border md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5 text-center">
                <s.icon className="mb-1 size-5 text-[#ff6b4a]" />
                <p className="font-heading text-2xl font-bold text-primary sm:text-3xl">
                  <Counter to={s.value} prefix={s.prefix ?? ""} suffix={s.suffix} />
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="mt-16 overflow-hidden bg-[#ff6b4a] py-3.5">
        <div className="flex w-max k-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-6 pr-6 text-sm font-semibold uppercase tracking-widest text-white"
            >
              {item}
              <SparklesIcon className="size-4 text-white/70" />
            </span>
          ))}
        </div>
      </div>

      {/* ============ SERVICES ============ */}
      <div className="pt-10">
        <Reveal className="mx-auto max-w-2xl px-6 pt-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ff6b4a]">
            What we do
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Three services. One trusted team.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Whatever brings you to us — a new home, a stack of paperwork, or
            money to move — we make it simple, honest, and fast.
          </p>
        </Reveal>
      </div>

      {/* Land & Property */}
      <ServiceSection
        eyebrow="Property"
        title="Find the property you've been dreaming of"
        description="Whether you're buying, selling, or renting, we connect you with verified land, houses, and apartments across the region — and we walk beside you from the first viewing to the final signature."
        bullets={[
          "Fresh listings, verified before they go live",
          "Direct contact with sellers — no middleman games",
          "Selling? List with us free, pay only when it sells",
          "Neighbourhood advice from people who actually live here",
        ]}
        imageQuery="/images/services/keys.jpg"
        imageAlt="A real estate agent handing over house keys"
        icon={HomeIcon}
        chip={{ icon: HomeIcon, label: "New this week", sub: "14 verified listings" }}
        cta={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/shop/land-property"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              Browse listings
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/list-property"
              className="inline-flex items-center justify-center rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-95"
            >
              List your property
            </Link>
          </div>
        }
      />

      {/* Property Documentation */}
      <div className="bg-[#f7f3ec]/60">
        <ServiceSection
          eyebrow="Documentation"
          title="Paperwork, minus the headache"
          description="Land title, building permits, vehicle registration — Ghana's paperwork can feel like a maze. We've walked it a thousand times. Let us guide you through it, step by step, in plain language."
          bullets={[
            "A clear checklist of exactly what you need — nothing more",
            "Land, house & vehicle documents handled end-to-end",
            "We catch the costly mistakes before they happen",
            "Plain-language explanations at every single step",
          ]}
          imageQuery="/images/services/docs.jpg"
          imageAlt="A professional signing a document with a pen"
          icon={FileTextIcon}
          reverse
          chip={{ icon: ShieldCheckIcon, label: "100% verified", sub: "1,150+ documents done" }}
          cta={
            <a
              href={whatsappLink("Hi, I'd like help with property documentation.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              <MessageCircleIcon className="size-4" />
              Start on WhatsApp — it's free to ask
            </a>
          }
        />
      </div>

      {/* Mobile Money */}
      <ServiceSection
        eyebrow="Cheap Data Bundles"
        title="Unbeatable Internet Data Offers for All Networks"
        description="Stay connected for less without breaking the bank. Enjoy massive discounts on high-speed data delivered instantly to your number—including MTN 1GB for just GH₵5, along with incredible deals for Telecel and AT users."
        bullets={[
          "MTN Data Deals: 1GB for GH₵5, plus high-value non-expiry packages",
          "Telecel & AT (AirtelTigo): Unbeatable cheap bundle offers for all budgets",
          "Instant delivery directly to your phone number within seconds",
          "Easy self-service order at plus-22.com or via fast WhatsApp request",
        ]}
        imageQuery="/images/services/momo.jpg"
        imageAlt="Person streaming and browsing with high-speed internet data on a smartphone"
        icon={SmartphoneIcon}
        chip={{ icon: ZapIcon, label: "Top Offer", sub: "MTN 1GB @ GH₵5" }}
        cta={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={whatsappLink("Hi, I'd like to buy cheap data bundles (MTN / Telecel / AT).")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              <MessageCircleIcon className="size-4" />
              Order Data on WhatsApp
            </a>
            <a
              href="https://plus-22.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/30 bg-primary-light/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary-light/20 active:scale-95"
            >
              Visit plus-22.com
            </a>
          </div>
        }
      />

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative overflow-hidden bg-primary py-20 sm:py-28">
        <div className="absolute -left-24 top-0 size-96 rounded-full bg-[#ff6b4a]/15 blur-3xl k-blob" />
        <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-primary-light/10 blur-3xl k-blob" />

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff6b4a]">
              How it works
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-primary-foreground sm:text-4xl">
              Simple from the very first message
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              No complicated forms. No office bureaucracy. Just four easy steps
              between you and getting it done.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 120}>
                <div className="group relative text-center">
                  {/* connector line (desktop) */}
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="absolute left-[calc(50%+2.5rem)] top-8 hidden w-[calc(100%-5rem)] border-t-2 border-dashed border-white/20 lg:block" />
                  )}

                  <div className="relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur transition-all duration-300 group-hover:-translate-y-1.5 group-hover:bg-[#ff6b4a]">
                    <step.icon className="size-7 text-primary-light transition-colors group-hover:text-white" />
                    <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-[#ff6b4a] font-heading text-xs font-bold text-white transition-colors group-hover:bg-white group-hover:text-[#ff6b4a]">
                      {i + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 font-heading text-lg font-semibold text-primary-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#ff6b4a]">
                Why us
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
                The team your neighbourhood already trusts
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-muted-foreground lg:text-right">
                We're not a faceless platform. We're the shop around the corner
                that treats your business like our own.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 100}>
                <div className="group h-full rounded-3xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-lg">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary ring-1 ring-primary/15 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-[#f7f3ec]/60 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff6b4a]">
              Testimonials
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Real people. Real stories.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Don't take our word for it — here's what our customers say.
            </p>
          </Reveal>

          <Reveal delay={150} className="mt-12">
            <Testimonials />
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff6b4a]">
              FAQ
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Questions? We've got answers.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Can't find what you're looking for? Message us anytime — real
              humans reply, usually within the hour.
            </p>
            <a
              href={whatsappLink("Hi, I have a question that isn't in your FAQ.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-95"
            >
              <MessageCircleIcon className="size-4" />
              Ask us anything
            </a>

            <div className="relative mt-10 hidden overflow-hidden rounded-3xl shadow-lg lg:block">
              <img
                src="/images/services/team.jpg"
                alt="Our friendly team smiling in the office"
                loading="lazy"
                className="aspect-4/5 w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-primary/90 p-4 backdrop-blur">
                <p className="font-heading text-sm font-semibold text-primary-foreground">
                  Visit us in-store
                </p>
                <p className="mt-0.5 text-xs text-primary-foreground/75">
                  Mon–Sat · 8:00am – 6:00pm
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="space-y-4 lg:col-span-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============ BIG CTA ============ */}
      <section className="px-6 pb-24">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-[#0a4742] px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="absolute -right-20 -top-20 size-72 rounded-full bg-[#ff6b4a]/25 blur-3xl k-blob" />
            <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-primary-light/15 blur-3xl k-blob" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#ff6b4a]">
                Ready when you are
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-heading text-3xl font-bold text-primary-foreground sm:text-5xl">
                Let's get it done — together.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-primary-foreground/80">
                One message is all it takes. Tell us what you need and we'll
                take it from there — no pressure, no obligation.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={whatsappLink("Hi, I'm ready to get started!")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#ff6b4a] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                >
                  <MessageCircleIcon className="size-4" />
                  Message us on WhatsApp
                </a>
                <Link
                  to="/shop/land-property"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:scale-95"
                >
                  <HomeIcon className="size-4" />
                  See properties first
                </Link>
              </div>
              <p className="mt-6 text-xs text-primary-foreground/60">
                Free consultation · No obligation · Reply within the hour
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <FloatingWhatsApp />
    </StorefrontLayout>
  );
}