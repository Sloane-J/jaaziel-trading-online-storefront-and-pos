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
			<div className="relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
				{/* Background ambient glow */}
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
					<div className="h-[40rem] w-[40rem] rounded-full bg-primary/5 blur-[100px]" />
				</div>

				<div className="relative z-10 overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-2xl shadow-primary/5">
					<div className="flex flex-col lg:flex-row">
						{/* Left Panel: Contact Details */}
						<div className="relative flex flex-col justify-between bg-muted/30 p-8 lg:w-2/5 lg:p-12">
							<div>
								<h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
									Get in touch
								</h1>
								<p className="mt-4 text-base text-muted-foreground">
									Have a question about a product or an order? Send us a
									message, or reach out directly using the details below.
								</p>

								<div className="mt-12 space-y-8">
									<div className="flex items-start gap-4">
										<div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
											<MapPinIcon className="h-5 w-5" />
										</div>
										<div>
											<p className="font-semibold text-foreground">Visit us</p>
											<p className="text-muted-foreground">{SHOP_ADDRESS}</p>
										</div>
									</div>

									<a
										href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`}
										className="group flex items-start gap-4 transition-opacity hover:opacity-80"
									>
										<div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
											<PhoneIcon className="h-5 w-5" />
										</div>
										<div>
											<p className="font-semibold text-foreground">
												Call or WhatsApp
											</p>
											<p className="text-muted-foreground">{SHOP_PHONE}</p>
										</div>
									</a>

									<a
										href={`mailto:${SHOP_EMAIL}`}
										className="group flex items-start gap-4 transition-opacity hover:opacity-80"
									>
										<div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
											<MailIcon className="h-5 w-5" />
										</div>
										<div>
											<p className="font-semibold text-foreground">Email</p>
											<p className="text-muted-foreground">{SHOP_EMAIL}</p>
										</div>
									</a>

									<div className="flex items-start gap-4">
										<div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
											<ClockIcon className="h-5 w-5" />
										</div>
										<div>
											<p className="font-semibold text-foreground">Hours</p>
											<p className="text-muted-foreground">
												Mon-Sat, 8:00 AM - 6:00 PM
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right Panel: Form */}
						<div className="bg-card p-8 lg:w-3/5 lg:p-12">
							{status === "success" ? (
								<div className="animate-in fade-in zoom-in-95 flex h-full min-h-[400px] flex-col items-center justify-center gap-5 text-center duration-500">
									<div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10">
										<CheckCircle2Icon className="h-12 w-12 text-green-500" />
									</div>
									<div className="space-y-2">
										<h2 className="font-heading text-3xl font-semibold text-foreground">
											Message sent!
										</h2>
										<p className="text-lg text-muted-foreground">
											Thanks for reaching out. We'll get back to you shortly.
										</p>
									</div>
									<Button
										variant="outline"
										size="lg"
										className="mt-6"
										onClick={() => setStatus("idle")}
									>
										Send another message
									</Button>
								</div>
							) : (
								<form onSubmit={handleSubmit} className="flex flex-col gap-6">
									<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
										<div className="space-y-2">
											<Label
												htmlFor="contact-name"
												className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
											>
												Name
											</Label>
											<Input
												id="contact-name"
												name="name"
												required
												placeholder="Your name"
												className="h-12 border-x-0 border-t-0 border-b-2 border-border/50 rounded-none bg-transparent px-0 shadow-none focus-visible:border-primary focus-visible:ring-0"
											/>
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="contact-email"
												className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
											>
												Email
											</Label>
											<Input
												id="contact-email"
												name="email"
												type="email"
												required
												placeholder="you@example.com"
												className="h-12 border-x-0 border-t-0 border-b-2 border-border/50 rounded-none bg-transparent px-0 shadow-none focus-visible:border-primary focus-visible:ring-0"
											/>
										</div>
									</div>

									<div className="space-y-2 pt-4">
										<Label
											htmlFor="contact-message"
											className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
										>
											Message
										</Label>
										<Textarea
											id="contact-message"
											name="message"
											required
											rows={4}
											placeholder="How can we help?"
											className="resize-none border-x-0 border-t-0 border-b-2 border-border/50 rounded-none bg-transparent px-0 py-3 shadow-none focus-visible:border-primary focus-visible:ring-0"
										/>
									</div>

									{status === "error" && (
										<div
											role="alert"
											className="mt-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive"
										>
											{error}
										</div>
									)}

									<Button
										type="submit"
										disabled={status === "submitting"}
										className="mt-4 h-14 w-full rounded-xl text-lg font-medium transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 active:scale-100 sm:w-auto sm:self-end sm:px-12"
									>
										{status === "submitting" ? (
											<span className="flex items-center gap-3">
												<span className="h-5 w-5 animate-spin rounded-full border-2 border-background border-r-transparent" />
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

					{/* Integrated Map */}
					<div className="h-[350px] w-full border-t border-border/50 bg-muted">
						<iframe
							title="Shop location"
							src={MAP_EMBED_SRC}
							width="100%"
							height="100%"
							loading="lazy"
							className="border-0 opacity-90 transition-opacity hover:opacity-100 grayscale hover:grayscale-0 duration-500"
						/>
					</div>
				</div>
			</div>
		</StorefrontLayout>
	);
}