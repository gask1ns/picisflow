export type ParseResult = {
  category: string;
  amount: number;
  description: string;
};

// Pattern: <kategori> <jumlah[unit?]> [catatan]
const PATTERN = /^([a-zA-Z\s]+?)\s+([\d][\d.,]*(?:[a-zA-Z]+\d*)?)(?:\s+(.*))?$/;

const UNIT_MAP: [string, number][] = [
  ["miliar", 1_000_000_000],
  ["milyar", 1_000_000_000],
  ["juta", 1_000_000],
  ["jt", 1_000_000],
  ["ribu", 1_000],
  ["rb", 1_000],
  ["rbu", 1_000],
];

function parseIndonesianAmount(raw: string): number {
  // Pure numeric
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);

  // Normalize comma to dot (Indonesian: "1,5" → "1.5")
  const s = raw.replace(/,/g, ".");

  // Check for unit suffix
  for (const [unit, multiplier] of UNIT_MAP) {
    if (s.includes(unit)) {
      const parts = s.split(unit);
      const main = parseFloat(parts[0] || "0");
      const frac = parts[1] ? parseFloat("0." + parts[1]) : 0;
      return Math.round((main + frac) * multiplier);
    }
  }

  // Remove thousand separators (dots): "1.500.000" → "1500000"
  const dotCount = (s.match(/\./g) || []).length;
  if (dotCount >= 2 || (dotCount === 1 && !s.includes("."))) {
    // Keep the last dot as decimal only if followed by exactly 1-2 digits
    const cleaned = s.replace(/\.(?=\d{3,})/g, "");
    const val = parseInt(cleaned, 10);
    if (!isNaN(val)) return val;
  }

  const val = parseInt(s, 10);
  return isNaN(val) ? 0 : val;
}

export function parseTransaction(text: string): ParseResult | null {
  const match = text.match(PATTERN);
  if (!match) return null;

  const category = match[1].trim().toLowerCase();
  const amount = parseIndonesianAmount(match[2]);
  const description = match[3]?.trim() ?? "";

  if (amount <= 0) return null;

  return { category, amount, description };
}
