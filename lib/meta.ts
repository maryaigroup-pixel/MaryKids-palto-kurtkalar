import { sha256 } from "./crypto";

type UserData = {
  ph?: string[];
  fn?: string[];
  ln?: string[];
  external_id?: string[];
  country?: string[];
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
};

export type CapiEvent = {
  event_name: "Lead" | "Purchase" | "ViewContent" | "Contact";
  event_id: string;
  event_time?: number;
  event_source_url?: string;
  action_source?: "website" | "system_generated" | "phone_call" | "chat" | "other";
  user_data: UserData;
  custom_data?: Record<string, unknown>;
};

/** Meta Conversions API ga hodisa yuborish */
export type CapiResult = { ok: boolean; skipped?: boolean; response?: unknown };

export async function sendCapiEvent(event: CapiEvent): Promise<CapiResult> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    console.warn("[CAPI] Pixel ID yoki access token yo'q — hodisa yuborilmadi");
    return { ok: false, skipped: true };
  }
  const version = process.env.META_API_VERSION || "v23.0";

  // Bo'sh maydonlarni olib tashlash
  const user_data = Object.fromEntries(
    Object.entries({ country: [sha256("uz")], ...event.user_data }).filter(
      ([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
    )
  );

  const body: Record<string, unknown> = {
    data: [
      {
        action_source: "website",
        event_time: Math.floor(Date.now() / 1000),
        ...event,
        user_data,
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;

  const res = await fetch(
    `https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) console.error("[CAPI] Xato:", JSON.stringify(json));
  return { ok: res.ok, response: json };
}

/** Request'dan IP va User-Agent olish */
export function getClientMeta(req: Request) {
  const h = req.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    undefined;
  const ua = h.get("user-agent") || undefined;
  return { ip, ua };
}

/** fbclid bo'lsa va _fbc cookie yo'q bo'lsa, fbc ni yasash */
export function buildFbc(fbc: string | undefined, sourceUrl: string | undefined) {
  if (fbc) return fbc;
  try {
    const fbclid = sourceUrl ? new URL(sourceUrl).searchParams.get("fbclid") : null;
    if (fbclid) return `fb.1.${Date.now()}.${fbclid}`;
  } catch {}
  return undefined;
}
