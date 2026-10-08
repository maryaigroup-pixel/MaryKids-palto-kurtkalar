import { NextResponse } from "next/server";
import crypto from "crypto";
import { unseal, type LeadToken } from "@/lib/crypto";
import { sendCapiEvent } from "@/lib/meta";
import { sendTelegram, escapeHtml, tashkentTime } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export async function POST(req: Request) {
  let body: { t?: string; amount?: number | string; pin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const adminPin = process.env.ADMIN_PIN;
  if (adminPin && !safeEqual(String(body.pin || ""), adminPin)) {
    return NextResponse.json({ ok: false, error: "PIN kod noto'g'ri" }, { status: 401 });
  }

  const lead = body.t ? unseal<LeadToken>(body.t) : null;
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Havola yaroqsiz yoki buzilgan" }, { status: 400 });
  }

  const amountUzs = Math.round(Number(String(body.amount ?? "").replace(/[^\d.]/g, "")));
  if (!Number.isFinite(amountUzs) || amountUzs < 1000 || amountUzs > 1_000_000_000) {
    return NextResponse.json({ ok: false, error: "Summani to'g'ri kiriting (so'mda)" }, { status: 422 });
  }

  const currency = (process.env.META_CURRENCY || "USD").toUpperCase();
  const rate = Number(process.env.USD_UZS_RATE || 12700);
  const value = currency === "USD" ? Math.round((amountUzs / rate) * 100) / 100 : amountUzs;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");

  const result = await sendCapiEvent({
    event_name: "Purchase",
    // Bir lid uchun bitta Purchase — havola qayta bosilsa ham Meta dublikatni olib tashlaydi
    event_id: `purchase_${lead.id}`,
    event_source_url: lead.url || siteUrl,
    action_source: "website",
    user_data: {
      ph: [lead.ph],
      fn: lead.fn ? [lead.fn] : undefined,
      ln: lead.ln ? [lead.ln] : undefined,
      external_id: [lead.xid],
      fbp: lead.fbp,
      fbc: lead.fbc,
      client_ip_address: lead.ip,
      client_user_agent: lead.ua,
    },
    custom_data: {
      value,
      currency,
      order_id: lead.id,
      content_name: lead.pr || "MaryKids buyurtma",
      content_category: "kids_outerwear",
      content_type: "product",
    },
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.skipped
          ? "Meta sozlanmagan (Pixel ID / access token)"
          : "Meta hodisani qabul qilmadi",
        details: result.response,
      },
      { status: 502 }
    );
  }

  const amountText = new Intl.NumberFormat("ru-RU").format(amountUzs).replace(/\u00a0/g, " ");
  await sendTelegram(
    `✅ <b>Purchase Meta'ga yuborildi</b>\n\n` +
      `📞 ${escapeHtml(lead.mp || "")}\n` +
      (lead.pr ? `🛍 ${escapeHtml(lead.pr)}\n` : "") +
      `💰 ${amountText} so'm` +
      (currency === "USD" ? ` (≈ $${value})` : "") +
      `\n🕒 ${tashkentTime()}`
  ).catch((e) => console.error("[purchase] Telegram:", e));

  return NextResponse.json({ ok: true, value, currency, amountUzs });
}
