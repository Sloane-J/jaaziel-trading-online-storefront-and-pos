export function formatPrice(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return `GHS ${value.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}