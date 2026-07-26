/**
 * WCAG 2.2 relative luminance and contrast ratio.
 *
 * Hand-written on purpose: frontend-spec §14 leaves no room for a colour
 * library, and this is twenty lines of arithmetic straight out of the spec.
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */

/** WCAG 2.2 AA, normal-size text. frontend-spec §13. */
export const WCAG_AA_NORMAL = 4.5;
/** WCAG 2.2 AA, large text (≥24px, or ≥18.66px bold). */
export const WCAG_AA_LARGE = 3;

/** `#RGB` or `#RRGGBB` → `[r, g, b]` in 0–255. */
export function parseHex(hex: string): [number, number, number] {
  const raw = hex.trim().replace(/^#/, '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Not a hex colour: ${hex}`);
  }
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

/** Linearise one 0–255 sRGB channel. */
function linearise(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** Contrast ratio between two opaque colours, 1 to 21. Order-independent. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** True when `foreground` on `background` meets the threshold. */
export function meetsContrast(
  foreground: string,
  background: string,
  threshold: number = WCAG_AA_NORMAL,
): boolean {
  return contrastRatio(foreground, background) >= threshold;
}
