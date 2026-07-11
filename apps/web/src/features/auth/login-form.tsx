import { Eye, EyeOff } from "lucide-react";
import type { FormEvent, JSX } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMergeGuestCart } from "@/features/storefront/hooks/use-cart";
import { authClient } from "@/lib/auth-client";

/**
 * Fonts used in this design:
 *  - "Playfair Display" (600/700) — the serif headline "Welcome Back"
 *  - "Inter" (400/500/600/700) — everything else
 *
 * Ideally load these once in index.html:
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
 *
 * They're also linked inline below so this component works standalone.
 */

 const ROLE_ROUTES: Record<string, string> = {
	superadmin: "/superadmin",
	admin: "/admin",
	cashier: "/pos",
	staff: "/orders",
	customer: "/",
 };

// Abstract flowing light photo — Shubham Dhage, Unsplash (unsplash.com/license, free to use)
const HERO_IMAGE_URL =
	"https://images.unsplash.com/photo-1760346738721-bc8e0678623f?fm=jpg&q=80&w=1400&auto=format&fit=crop";

function GoogleIcon(): JSX.Element {
	return (
		<svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
			<path
				fill="#4285F4"
				d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.8z"
			/>
			<path
				fill="#34A853"
				d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.28 24 12 24z"
			/>
			<path
				fill="#FBBC05"
				d="M5.27 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.29V6.6H1.26A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.26 5.4l4.01-3.11z"
			/>
			<path
				fill="#EA4335"
				d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.6l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75z"
			/>
		</svg>
	);
}

export function LoginForm(): JSX.Element {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [rememberMe, setRememberMe] = useState<boolean>(false);
	const [message, setMessage] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
	const mergeGuestCart = useMergeGuestCart();

	async function handleLogin(e: FormEvent<HTMLFormElement>): Promise<void> {
		e.preventDefault();
		setMessage("");
		setIsSubmitting(true);
		const { data, error } = await authClient.signIn.email({
			email,
			password,
		});

		if (error) {
			setIsSubmitting(false);
			setMessage(`Error: ${error.message}`);
			return;
		}

		const role = (data.user as { role?: string }).role;
		const destination = role ? ROLE_ROUTES[role] : undefined;

		if (!destination) {
			setIsSubmitting(false);
			setMessage(
				"Your account role is not recognized. Contact an administrator.",
			);
			return;
		}

		// Merge any items added to the cart before logging in.
		try {
			await mergeGuestCart.mutateAsync();
		} catch {
			// Non-fatal — if the merge fails, the customer's own cart still loads normally.
			// Don't block login over a cart-merge hiccup.
		}

		setIsSubmitting(false);
		navigate(destination);
}

	async function handleGoogleSignIn(): Promise<void> {
		setMessage("");
		const { error } = await authClient.signIn.social({
			provider: "google",
		});
		if (error) {
			setMessage(`Error: ${error.message}`);
		}
	}

	return (
		<div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
			{/* Inline font import so this component renders correctly standalone */}
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap"
			/>

			{/* Left panel — image */}
			<div className="relative hidden md:block">
				<img
					src={HERO_IMAGE_URL}
					alt=""
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

				<div className="relative flex h-full flex-col justify-between p-10">
					<div className="flex items-center gap-3">
						<span
							className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90"
							style={{ fontFamily: "'Playfair Display', serif" }}
						>
							Jaaziel Trading Enterprise
						</span>
						<span className="h-px flex-1 bg-white/40" />
					</div>

					<div className="max-w-xs">
						<h2
							className="text-4xl font-bold leading-[1.1] text-white"
							style={{ fontFamily: "'Playfair Display', serif" }}
						>
							Run Every Sale With Confidence
						</h2>
						<p className="mt-4 text-sm leading-relaxed text-white/70">
							One dashboard for your inventory, your till, and your team — built
							to keep every transaction accurate and every role in control of
							exactly what they need.
						</p>
					</div>
				</div>
			</div>

			{/* Right panel — form */}
			<div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-12 md:px-20">
				<div className="mx-auto w-full max-w-sm">
					<div className="mb-10 flex items-center gap-2">
						<span className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-900 text-[10px] text-zinc-900">
							◎
						</span>
						<span
							className="text-sm font-semibold text-zinc-900"
							style={{ fontFamily: "'Playfair Display', serif" }}
						>
							Jaaziel Trading Enterprise
						</span>
					</div>

					<h1
						className="text-4xl text-zinc-900"
						style={{
							fontFamily: "'Playfair Display', serif",
							fontWeight: 700,
						}}
					>
						Welcome Back
					</h1>
					<p className="mt-2 text-sm text-zinc-500">
						Enter your email and password to access your account
					</p>

					<form
						onSubmit={handleLogin}
						className="mt-8 flex flex-col gap-5"
						noValidate
					>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="email" className="text-sm text-zinc-700">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="h-11 rounded-xl border-zinc-200 bg-zinc-100 px-4 text-sm placeholder:text-zinc-400 focus-visible:ring-zinc-900"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor="password" className="text-sm text-zinc-700">
								Password
							</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="h-11 rounded-xl border-zinc-200 bg-zinc-100 px-4 pr-10 text-sm placeholder:text-zinc-400 focus-visible:ring-zinc-900"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between text-sm">
							<label className="flex items-center gap-2 text-zinc-600">
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={(e) => setRememberMe(e.target.checked)}
									className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
								/>
								Remember me
							</label>
							<a
								href="/forgot-password"
								className="text-zinc-500 hover:text-zinc-900"
							>
								Forgot Password
							</a>
						</div>

						<Button
							type="submit"
							disabled={isSubmitting}
							className="mt-1 h-11 w-full rounded-xl bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800"
						>
							{isSubmitting ? "Signing in…" : "Sign In"}
						</Button>

						<Button
							type="button"
							variant="outline"
							onClick={handleGoogleSignIn}
							className="h-11 w-full rounded-xl border-zinc-200 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
						>
							<GoogleIcon />
							Sign In with Google
						</Button>

						{message && (
							<p role="alert" className="text-center text-sm text-red-600">
								{message}
							</p>
						)}
					</form>

					<p className="mt-8 text-center text-sm text-zinc-500">
						Don&apos;t have an account?{" "}
						<a
							href="/signup"
							className="font-semibold text-zinc-900 hover:underline"
						>
							Sign Up
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
