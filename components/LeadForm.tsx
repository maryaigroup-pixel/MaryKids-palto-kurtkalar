"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { products, findSelection, formatSum, selectionKey } from "@/lib/products";
import { trackPixel, getCookie } from "./MetaPixel";
import { useSelection } from "./Selection";

function formatUzPhone(input: string) {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("998")) d = d.slice(3);
  d = d.slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return "+998 " + parts.join(" ");
}

function newEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}

export default function LeadForm() {
  const { selected, setSelected } = useSelection();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const sel = findSelection(selected);

  // Tanlov o'zgarsa, eski xato xabarini olib tashlash
  useEffect(() => {
    setStatus((s) => (s === "error" ? "idle" : s));
  }, [selected]);
  const digits = phone.replace(/\D/g, "");
  const valid = Boolean(sel) && name.trim().length >= 2 && digits.length === 12;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sel) {
      setStatus("error");
      setError("Avval mahsulot va rangni tanlang");
      return;
    }
    if (!valid || status === "loading") return;
    setStatus("loading");
    setError("");
    const eventId = newEventId();

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: digits,
          selection: sel.key,
          eventId,
          website,
          fbp: getCookie("_fbp"),
          fbc: getCookie("_fbc"),
          sourceUrl: window.location.href,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");

      // Pixel Lead — CAPI bilan bir xil eventID (dublikat bo'lmaydi)
      trackPixel(
        "Lead",
        {
          content_ids: [sel.key],
          content_name: `${sel.product.title} — ${sel.variant.color}`,
          content_category: sel.product.category,
          ...(sel.product.price ? { value: sel.product.price, currency: "UZS" } : {}),
        },
        eventId
      );
      setStatus("success");

      const channel = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL;
      if (channel) setTimeout(() => (window.location.href = channel), 1800);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    }
  }

  if (status === "success") {
    return (
      <div className="form-card success">
        <div className="success-icon">✓</div>
        <h3>Rahmat, {name.split(" ")[0]}!</h3>
        <p>
          <b>
            {sel?.product.title} — {sel?.variant.color}
          </b>{" "}
          uchun arizangiz qabul qilindi. Menejerimiz tez orada siz bilan bog'lanadi.
        </p>
        <p className="muted">Telegram kanalimizga yo'naltirilmoqdasiz…</p>
        {process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL && (
          <a className="btn btn-primary" href={process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL}>
            Telegram kanalga o'tish
          </a>
        )}
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <h3>Buyurtma qoldiring</h3>

      {sel ? (
        <div className="picked">
          <div className="picked-img">
            <Image src={sel.variant.image} alt="" fill unoptimized={sel.variant.image.endsWith(".svg")} sizes="64px" />
          </div>
          <div>
            <span className="muted">Siz tanladingiz</span>
            <strong>
              {sel.product.title} — {sel.variant.color}
            </strong>
            <span className="picked-price">
              {sel.product.price ? formatSum(sel.product.price) : "Narxini menejer aytadi"}
            </span>
          </div>
        </div>
      ) : (
        <p className="pick-hint">👆 Yuqoridagi kolleksiyadan mahsulot va rangni tanlang yoki shu yerda tanlang</p>
      )}

      <label className="field">
        <span>Mahsulot va rang</span>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} required>
          <option value="">— Tanlang —</option>
          {products.map((p) => (
            <optgroup key={p.id} label={p.title + (p.price ? ` · ${formatSum(p.price)}` : "")}>
              {p.variants.map((v) => (
                <option key={v.id} value={selectionKey(p.id, v.id)}>
                  {p.title} — {v.color}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Ismingiz</span>
        <input
          type="text"
          autoComplete="given-name"
          placeholder="Masalan: Dilnoza"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Telefon raqamingiz</span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(formatUzPhone(e.target.value))}
          required
        />
      </label>

      {/* honeypot */}
      <input
        className="hp"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        aria-hidden="true"
      />

      {status === "error" && <p className="error">{error}</p>}

      <button className="btn btn-primary btn-block" disabled={status === "loading"}>
        {status === "loading" ? "Yuborilmoqda…" : "Buyurtma berish"}
      </button>
      <p className="tiny">🔒 Ma'lumotlaringiz uchinchi shaxslarga berilmaydi</p>
    </form>
  );
}
