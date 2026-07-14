import {
	CheckCircle2Icon,
	ClockIcon,
	MailIcon,
	MapPinIcon,
	PhoneIcon,
} from "lucide-react";
import { useState } from "react";
import { StorefrontLayout } from "@/components/shared/storefront-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentTitle } from "@/lib/use-document-title";

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

// Madina, Accra, Ghana
const SHOP_ADDRESS = "Madina, Accra, Ghana";
const SHOP_LAT = 5.6837;
const SHOP_LNG = -0.1669;
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${SHOP_LAT},${SHOP_LNG}&z=15&output=embed`;

const SHOP_PHONE = "+233 000 000 000"; // replace with real number
const SHOP_EMAIL = "jaazieltradingenterprise@gmail.com"; // replace with real email

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ContactPage() {
  useDocumentTitle("Contact");
	const [status, setStatus] = useState<SubmitState>("idle");
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setStatus("submitting");
  setError(null);

  const form = e.currentTarget;
  const formData = new FormData(form);
  formData.append("access_key", WEB3FORMS_ACCESS_KEY);

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (result.success) {
      setStatus("success");
      form.reset();
    } else {
      throw new Error(
        result.message || "Something went wrong. Please try again.",
      );
    }
  } catch (err) {
    setStatus("error");
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again.",
    );
  }
}

	return (
		<StorefrontLayout>
			<div className="relative mx-auto max-w-[1200px] px-6 py-16 md:py-24">
				{/* Glassmorphism subtle background blob */}
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
					<div className="h-[40rem] w-[40rem] rounded-full bg-primary/5 blur-3xl" />
				</div>

				<div className="relative z-10">
					{/* Hero Section */}
					<div className="mx-auto mb-16 max-w-2xl space-y-4 text-center">
						<h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
							Get in touch
						</h1>
						<p className="text-lg text-muted-foreground">
							Have a question about a product or an order? Send us a
							message, or reach out directly using the details below.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
						{/* Left: Contact Info Bento Grid */}
						<div className="grid h-fit grid-cols-1 gap-6 sm:grid-cols-2">
							<div className="rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
									<MapPinIcon className="h-6 w-6 text-primary" />
								</div>
								<p className="mb-1 text-base font-semibold text-foreground">
									Visit us
								</p>
								<p className="text-sm text-muted-foreground">
									{SHOP_ADDRESS}
								</p>
							</div>

							<a
								href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`}
								className="group rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md"
							>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
									<PhoneIcon className="h-6 w-6 text-primary" />
								</div>
								<p className="mb-1 text-base font-semibold text-foreground">
									Call or WhatsApp
								</p>
								<p className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
									{SHOP_PHONE}
								</p>
							</a>

							<a
								href={`mailto:${SHOP_EMAIL}`}
								className="group rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md"
							>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
									<MailIcon className="h-6 w-6 text-primary" />
								</div>
								<p className="mb-1 text-base font-semibold text-foreground">
									Email
								</p>
								<p className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
									{SHOP_EMAIL}
								</p>
							</a>

							<div className="rounded-2xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
									<ClockIcon className="h-6 w-6 text-primary" />
								</div>
								<p className="mb-1 text-base font-semibold text-foreground">
									Hours
								</p>
								<p className="text-sm text-muted-foreground">
									Mon-Sat, 8:00 AM - 6:00 PM
								</p>
							</div>
						</div>

						{/* Right: Premium Form */}
						<div className="relative rounded-3xl border border-border/50 bg-card/80 p-8 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:p-10">
							{status === "success" ? (
								<div className="animate-in fade-in zoom-in-95 flex h-full min-h-[350px] flex-col items-center justify-center gap-4 text-center duration-500">
									<div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
										<CheckCircle2Icon className="h-10 w-10 text-green-500" />
									</div>
									<div className="space-y-1">
										<p className="font-heading text-2xl font-semibold text-foreground">
											Message sent
										</p>
										<p className="text-muted-foreground">
											Thanks for reaching out. We'll get back to you
											soon.
										</p>
									</div>
									<Button
										variant="outline"
										className="mt-4"
										onClick={() => setStatus("idle")}
									>
										Send another message
									</Button>
								</div>
							) : (
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-2">
										<Label
											htmlFor="contact-name"
											className="text-sm font-medium"
										>
											Name
										</Label>
										<Input
											id="contact-name"
											name="name"
											required
											placeholder="Your name"
											className="border-border/50 bg-muted/30 transition-colors focus:bg-background"
										/>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="contact-email"
											className="text-sm font-medium"
										>
											Email
										</Label>
										<Input
											id="contact-email"
											name="email"
											type="email"
											required
											placeholder="you@example.com"
											className="border-border/50 bg-muted/30 transition-colors focus:bg-background"
										/>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="contact-message"
											className="text-sm font-medium"
										>
											Message
										</Label>
										<Textarea
											id="contact-message"
											name="message"
											required
											rows={5}
											placeholder="How can we help?"
											className="resize-none border-border/50 bg-muted/30 transition-colors focus:bg-background"
										/>
									</div>

									{status === "error" && (
										<div
											role="alert"
											className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
										>
											{error}
										</div>
									)}

									<Button
										type="submit"
										disabled={status === "submitting"}
										className="h-12 w-full text-base transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
									>
										{status === "submitting" ? (
											<span className="flex items-center gap-2">
												<span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
												Sending...
											</span>
										) : (
											"Send message"
										)}
									</Button>
								</form>
							)}
						</div>
					</div>

					{/* Bottom: Relocated Full-Width Map */}
					<div className="mt-16 overflow-hidden rounded-3xl border border-border/50 bg-card shadow-xl shadow-primary/5">
						<iframe
							title="Shop location"
							src={MAP_EMBED_SRC}
							width="100%"
							height="400"
							loading="lazy"
							className="block border-0 transition-all duration-700"
						/>
					</div>
				</div>
			</div>
		</StorefrontLayout>
	);
}