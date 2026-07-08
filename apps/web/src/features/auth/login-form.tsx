import type { FormEvent, JSX } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const ROLE_ROUTES: Record<string, string> = {
	superadmin: "/superadmin",
	admin: "/admin",
	cashier: "/pos",
	staff: "/orders",
};

export function LoginForm(): JSX.Element {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const navigate = useNavigate();

	async function handleLogin(e: FormEvent<HTMLFormElement>): Promise<void> {
		e.preventDefault();
		const { data, error } = await authClient.signIn.email({ email, password });

		if (error) {
			setMessage(`Error: ${error.message}`);
			return;
		}

		const role = (data.user as { role?: string }).role;
		const destination = role ? ROLE_ROUTES[role] : undefined;

		if (!destination) {
			setMessage(
				"Your account role is not recognized. Contact an administrator.",
			);
			return;
		}

		navigate(destination);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Jaaziel Trading Enterprise</CardTitle>
					<CardDescription>Sign in to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleLogin}
						className="flex flex-col gap-4"
						noValidate
					>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								autoComplete="current-password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						<Button type="submit" className="mt-2">
							Log in
						</Button>

						{message && (
							<p role="alert" className="text-sm text-destructive">
								{message}
							</p>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
