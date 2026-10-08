import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  sha256,
  normalizePhone,
  normalizeName,
  isValidUzPhone,
  formatPhone,
  maskPhone,
  seal,
  type LeadToken,
} from "@/lib/crypto";
import { sendCapiEvent, getClientMeta, buildFbc } from "@/lib/meta";
import { sendTelegram, escapeHtml, tashkentTime } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  phone?: string;
  product?: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
  sourceUrl?: string;
  website?: string; // honeypot (botlar uchun yashirin maydon)
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  // Spam-bot himoyasi
  if (body.website) return NextResponse.json({ ok: true });

  const name = (body.name || "").trim().slice(0, 80);
  const phone = normalizePhone(body.phone || "");
  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "Ismingizni kiriting" }, { status: 422 });
  }
  if (!isValidUzPhone(phone)) {
    return NextResponse.json({ ok: false, error: "Telefon raqam noto'g'ri" }, { status: 422 });
  }

  const eventId =
    body.eventId && /^[\w-]{8,64}$/.test(body.eventId) ? body.eventId : crypto.randomUUID();
  const { ip, ua } = getClientMeta(req);
  const fbc = buildFbc(body.fbc, body.sourceUrl);
  const fbp = body.fbp || undefined;
  const product = (body.product || "").slice(0, 80);
  const sourceUrl = (body.sourceUrl || "").slice(0, 500);

  const [first, ...rest] = normalizeName(name).split(" ");
  const fnHash = first ? sha256(first) : undefined;
  const lnHash = rest.length ? sha256(rest.join(" ")) : undefined;
  const phHash = sha256(phone);
  const xidHash = sha256(phone); // external_id — mijozni telefon orqali bog'laymiz

  // Havola ichiga faqat xeshlangan ma'lumot + texnik identifikatorlar, keyin AES-256-GCM shifrlash
  const tokenPayload: LeadToken = {
    id: eventId,
    ts: Math.floor(Date.now() / 1000),
    ph: phHash,
    fn: fnHash,
    ln: lnHash,
    xid: xidHash,
    fbp,
    fbc,
    ip,
    ua: ua?.slice(0, 300),
    pr: product || undefined,
    mp: maskPhone(phone),
    url: sourceUrl || undefined,
  };
  const token = seal(tokenPayload);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const purchaseLink = `${siteUrl}/purchase?t=${token}`;

  // UTM'larni olish
  let utm = "";
  try {
    const sp = new URL(sourceUrl).searchParams;
    const parts = ["utm_source", "utm_campaign", "utm_content"]
      .map((k) => (sp.get(k) ? `${k.replace("utm_", "")}: ${sp.get(k)}` : ""))
      .filter(Boolean);
    if (parts.length) utm = `\n📊 ${escapeHtml(parts.join(" | "))}`;
  } catch {}

  const text =
    `🧥 <b>Yangi lid — MaryKids</b>\n\n` +
    `👤 <b>Ism:</b> ${escapeHtml(name)}\n` +
    `📞 <b>Tel:</b> <a href="tel:+${phone}">${formatPhone(phone)}</a>\n` +
    (product ? `🛍 <b>Mahsulot:</b> ${escapeHtml(product)}\n` : "") +
    `🕒 ${tashkentTime()}` +
    utm +
    `\n\n🔐 <a href="${purchaseLink}">💰 Xarid qildi → summani Meta'ga yuborish</a>`;

  const [tg, capi] = await Promise.allSettled([
    sendTelegram(text),
    sendCapiEvent({
      event_name: "Lead",
      event_id: eventId,
      event_source_url: sourceUrl || siteUrl,
      user_data: {
        ph: [phHash],
        fn: fnHash ? [fnHash] : undefined,
        ln: lnHash ? [lnHash] : undefined,
        external_id: [xidHash],
        fbp,
        fbc,
        client_ip_address: ip,
        client_user_agent: ua,
      },
      custom_data: { content_name: product || "MaryKids lid", content_category: "kids_outerwear" },
    }),
  ]);

  if (tg.status === "rejected") console.error("[lead] Telegram:", tg.reason);
  if (capi.status === "rejected") console.error("[lead] CAPI:", capi.reason);

  if (tg.status === "rejected") {
    return NextResponse.json(
      { ok: false, error: "Xatolik yuz berdi, iltimos qayta urinib ko'ring" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, eventId });
}
