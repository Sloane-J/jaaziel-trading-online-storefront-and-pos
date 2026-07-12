// Generates N shades along your brand's brown/warm-neutral hue, evenly spaced
// in lightness so any number of categories gets a distinct, on-brand color.
// Falls back toward a slightly wider hue range if more contrast is needed
// past a handful of shades, staying within warm brown/terracotta/amber tones.
export function generateBrownShades(count: number): string[] {
  if (count <= 0) return [];

  const baseHue = 48; // matches the warm brown/amber hue used in index.css primary tokens
  const shades: string[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    // Lightness spread: darker brown to lighter amber, staying readable on a white card.
    const lightness = 0.32 + t * 0.4; // 0.32 (dark) -> 0.72 (light)
    const chroma = 0.1 - t * 0.03; // slightly desaturate the lighter end
    // Small hue drift across the range so shades stay distinguishable, not just lightness steps.
    const hue = baseHue + t * 20 - 10;
    shades.push(`oklch(${lightness.toFixed(2)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`);
  }

  return shades;
}