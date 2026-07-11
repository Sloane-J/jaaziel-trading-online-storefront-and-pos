const GUEST_TOKEN_KEY = "jaaziel_guest_token";

// Returns the existing guest cart token from localStorage, or generates
// and stores a new one. Used to identify an anonymous visitor's cart
// across requests before they log in.
export function getGuestToken(): string {
  const existing = localStorage.getItem(GUEST_TOKEN_KEY);
  if (existing) return existing;

  const token = crypto.randomUUID();
  localStorage.setItem(GUEST_TOKEN_KEY, token);
  return token;
}

export function clearGuestToken(): void {
  localStorage.removeItem(GUEST_TOKEN_KEY);
}