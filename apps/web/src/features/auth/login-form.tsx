import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(`Logged in as ${data.user.email}`);
    }
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3 max-w-sm p-6">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <button type="submit" className="bg-primary text-primary-foreground rounded px-3 py-2">
        Log in
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}