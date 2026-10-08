import crypto from "crypto";

/** SHA-256 (hex) — Meta talabiga mos */
export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Telefonni Meta formatiga keltirish: faqat raqamlar, mamlakat kodi bilan (998XXXXXXXXX) */
export function normalizePhone(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 9) digits = "998" + digits;
  return digits;
}

export function isValidUzPhone(raw: string): boolean {
  return /^998\d{9}$/.test(normalizePhone(raw));
}

/** Ismni Meta formatiga keltirish: kichik harf, belgilarsiz */
export function normalizeName(raw: string): string {
  return (raw || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .replace(/\s+/g, " ");
}

/** +998 90 123 45 67 ko'rinishi */
export function formatPhone(digits: string): string {
  const d = normalizePhone(digits);
  if (d.length !== 12) return "+" + d;
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
}

/** +998 ** *** 45 67 — purchase sahifasida mijozni tanish uchun */
export function maskPhone(digits: string): string {
  const d = normalizePhone(digits);
  if (d.length !== 12) return "***";
  return `+998 ** *** ${d.slice(8, 10)} ${d.slice(10)}`;
}

function getKey(): Buffer {
  const secret = process.env.LINK_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("LINK_SECRET muhit o'zgaruvchisi o'rnatilmagan (kamida 32 belgi)");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/** Obyektni AES-256-GCM bilan shifrlab, URL uchun xavfsiz tokenga aylantirish */
export function seal(payload: object): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

/** Tokenni ochish. Soxta yoki buzilgan bo'lsa null qaytaradi */
export function unseal<T = unknown>(token: string): T | null {
  try {
    const buf = Buffer.from(token, "base64url");
    if (buf.length < 29) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return JSON.parse(dec.toString("utf8")) as T;
  } catch {
    return null;
  }
}

/** Shifrlangan havola ichidagi ma'lumot (shaxsiy ma'lumotlar faqat SHA-256 xesh holida) */
export type LeadToken = {
  id: string; // lead event_id
  ts: number; // lid vaqti (unix sekund)
  ph: string; // sha256(telefon)
  fn?: string; // sha256(ism)
  ln?: string; // sha256(familiya)
  xid: string; // sha256(external_id)
  fbp?: string;
  fbc?: string;
  ip?: string;
  ua?: string;
  pr?: string; // mahsulot
  mp?: string; // maskalangan telefon
  url?: string; // lid qoldirilgan sahifa
};
