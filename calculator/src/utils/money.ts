// The ONLY place where API decimal strings ("2997.75") become JS numbers.
// Keeping this isolated means the rest of the app can't accidentally do math
// on raw strings or re-parse the same value inconsistently.

/** Parse a backend decimal string into a number. */
export function toNumber(value: string): number {
  return parseFloat(value)
}

const audFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
})

/** Format a number (or API decimal string) as Australian currency, e.g. "$2,997.75". */
export function formatAUD(value: number | string): string {
  const n = typeof value === 'string' ? toNumber(value) : value
  return audFormatter.format(n)
}

/** Format a rate as a percentage, e.g. 6 -> "6.00%". */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}
