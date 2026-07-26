/**
 * Interaction constants the §5.4 scales cannot express. Normative sources:
 * frontend-spec.md §9.1, §11, §13. Moved from apps/web's local-tokens block
 * by M0-SH-13 (D-018 froze the list).
 */

/**
 * ms — §11 "Skeleton | 1.4s linear shimmer, static under reduced-motion".
 * Deliberately outside the §5.4 `dur` scale: those cap at 280ms because they
 * time interaction feedback, and this is an idle loop. The cycle is opacity
 * only — a sweeping gradient is the conventional shimmer and CLAUDE.md §4
 * bans gradients outright.
 */
export const shimmerDuration = 1400;

/** ms — §9.1 "`Tooltip` | `content`, `delay=400`". Reveal state only. */
export const tooltipDelay = 400;

/**
 * px — §13 "Touch targets ≥ 44×44 on `sm`/`xs` and on native, including
 * `Meter`". The §5.4 space scale steps 40 → 56 around it, so 44 cannot be
 * composed from tokens without arithmetic at a call site.
 */
export const touchTarget = 44;

/**
 * §11 — "Sheet | … backdrop → `rgb(22 23 26/.32)`", verbatim. Deliberately an
 * absolute value and not `color-mix(… ink …)`: ink inverts with the theme,
 * and a dialog backdrop that turns pale in dark mode is not what §11
 * specifies. The one non-hex absolute colour in the system.
 */
export const sheetBackdrop = 'rgb(22 23 26/.32)';
