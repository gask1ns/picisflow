export type ParsedMutation = {
  amount: number;
  type: "income" | "expense";
  description?: string;
  categoryHint?: string;
};

type BankPattern = {
  name: string;
  regex: RegExp;
  type: "income" | "expense";
  amountGroup: number;
  descGroup?: number;
};

const patterns: BankPattern[] = [
  // BCA: TRX/Rp1.000.000/ke 0812xxxxxx/BCA MOBILE/27/06/26/20:15/123456/00
  { name: "BCA", regex: /trx\/(?:rp)?([\d.]+)\/(?:ke|di)\s*(\S+)/i, type: "expense", amountGroup: 1, descGroup: 2 },
  // BCA: KREDIT/Rp1.000.000/dari 0812xxxxxx/
  { name: "BCA", regex: /kredit\/(?:rp)?([\d.]+)\/dari\s*(\S+)/i, type: "income", amountGroup: 1, descGroup: 2 },

  // Mandiri: Pembelian Rp1.000.000 di TOKO ABC - Mandiri Debit
  { name: "Mandiri", regex: /pembelian\s+(?:rp)?([\d.]+)\s+di\s+(\S[\w\s]+?)(?:\s*[-–]|\s*$)/i, type: "expense", amountGroup: 1, descGroup: 2 },
  // Mandiri: Transfer dari 1234567890 a.n BUDI Rp1.000.000
  { name: "Mandiri", regex: /(?:transfer|tranfer)\s+dari\s+\S+\s+a\.n\s+\S[\w\s]+\s+(?:rp)?([\d.]+)/i, type: "income", amountGroup: 1 },
  // Mandiri: Transfer ke 1234567890 a.n BUDI Rp1.000.000
  { name: "Mandiri", regex: /(?:transfer|tranfer)\s+ke\s+\S+\s+a\.n\s+\S[\w\s]+\s+(?:rp)?([\d.]+)/i, type: "expense", amountGroup: 1 },

  // BNI: DEBIT Rp1.000.000 - ABC Store
  { name: "BNI", regex: /debit\s+(?:rp)?([\d.]+)\s*[-–]\s*(\S[\w\s]+?)(?:\s*\d{2}\/\d{2}|\s*$)/i, type: "expense", amountGroup: 1, descGroup: 2 },
  // BNI: KREDIT Rp1.000.000 - Transfer dari BUDI
  { name: "BNI", regex: /kredit\s+(?:rp)?([\d.]+)\s*[-–]\s*(\S[\w\s]+?)(?:\s*\d{2}\/\d{2}|\s*$)/i, type: "income", amountGroup: 1, descGroup: 2 },

  // BRI: Pembelian Rp1.000.000 di ABC
  { name: "BRI", regex: /pembelian\s+(?:rp)?([\d.]+)\s+di\s+(\S[\w\s]+?)(?:\s*,\s*\d{2}\/\d{2}|\s*$)/i, type: "expense", amountGroup: 1, descGroup: 2 },
  // BRI: Transfer Masuk Rp1.000.000 dari BUDI
  { name: "BRI", regex: /transfer\s+masuk\s+(?:rp)?([\d.]+)\s+dari\s+(\S[\w\s]+?)(?:\s*$)/i, type: "income", amountGroup: 1, descGroup: 2 },

  // GoPay: Pembayaran Rp1.000.000 ke ABC berhasil
  { name: "GoPay", regex: /(?:pembayaran|bayar)\s+(?:rp)?([\d.]+)\s+ke\s+(\S[\w\s]+?)(?:\s+berhasil|\s*$)/i, type: "expense", amountGroup: 1, descGroup: 2 },
  // GoPay: Menerima Rp1.000.000 dari BUDI
  { name: "GoPay", regex: /menerima\s+(?:rp)?([\d.]+)\s+dari\s+(\S[\w\s]+?)(?:\s*$)/i, type: "income", amountGroup: 1, descGroup: 2 },

  // OVO: Pembayaran Rp1.000.000 - ABC Store
  { name: "OVO", regex: /pembayaran\s+(?:rp)?([\d.]+)\s*[-–]\s*(\S[\w\s]+?)(?:\s*$)/i, type: "expense", amountGroup: 1, descGroup: 2 },
  // OVO: Transfer Masuk Rp1.000.000 dari BUDI
  { name: "OVO", regex: /transfer\s+masuk\s+(?:rp)?([\d.]+)\s+dari\s+(\S[\w\s]+?)(?:\s*$)/i, type: "income", amountGroup: 1, descGroup: 2 },

  // DANA: Berhasil Rp1.000.000 - ABC Store
  { name: "DANA", regex: /berhasil\s+(?:rp)?([\d.]+)\s*[-–]\s*(\S[\w\s]+?)(?:\s*$)/i, type: "expense", amountGroup: 1, descGroup: 2 },
  // DANA: Diterima Rp1.000.000 dari BUDI
  { name: "DANA", regex: /diterima\s+(?:rp)?([\d.]+)\s+dari\s+(\S[\w\s]+?)(?:\s*$)/i, type: "income", amountGroup: 1, descGroup: 2 },

  // ShopeePay: Berhasil bayar Rp1.000.000
  { name: "ShopeePay", regex: /berhasil\s+bayar\s+(?:rp)?([\d.]+)/i, type: "expense", amountGroup: 1 },
  // ShopeePay: Diterima Rp1.000.000 dari BUDI
  { name: "ShopeePay", regex: /diterima\s+(?:rp)?([\d.]+)\s+dari\s+(\S[\w\s]+?)(?:\s*$)/i, type: "income", amountGroup: 1, descGroup: 2 },

  // Generic: +Rp1.000.000 (income) or -Rp1.000.000 (expense)
  { name: "Generic", regex: /([+-])\s*(?:rp)?([\d.,]+)/i, type: "expense", amountGroup: 2 },
  // Generic: "Rp1.000.000" alone with keyword "masuk" / "diterima" / "kredit"
  { name: "Generic", regex: /(?:masuk|diterima|kredit|transfer\s+dari)\s+(?:rp)?([\d.,]+)/i, type: "income", amountGroup: 1 },
  // Generic: "Rp1.000.000" with keyword "keluar" / "debit" / "bayar" / "pembayaran"
  { name: "Generic", regex: /(?:keluar|debit|bayar|pembayaran|belanja|pembelian|trx)\s+(?:rp)?([\d.,]+)/i, type: "expense", amountGroup: 1 },
];

function normalizeAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10);
}

export function parseSMS(text: string): ParsedMutation | null {
  for (const p of patterns) {
    const match = text.match(p.regex);
    if (!match) continue;

    const amount = normalizeAmount(match[p.amountGroup]);
    if (isNaN(amount) || amount <= 0) continue;

    let description = p.descGroup ? match[p.descGroup]?.trim() : undefined;

    let type = p.type;
    // Re-check for generic sign patterns (overrides default)
    if (p.name === "Generic" && p.amountGroup === 2) {
      type = match[1] === "+" ? "income" : "expense";
    }

    // If no description from regex, create from bank name
    if (!description) {
      description = `Transaksi ${p.name}`;
    }

    // Shorten long descriptions
    if (description && description.length > 60) {
      description = description.substring(0, 60) + "...";
    }

    return {
      amount,
      type,
      description: `${p.name}: ${description}`,
      categoryHint: type === "income" ? "Lainnya (Income)" : "Lainnya (Expense)",
    };
  }

  return null;
}
