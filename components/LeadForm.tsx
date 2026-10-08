"use client";

import { useEffect, useState } from "react";
import { products } from "@/lib/products";
import { trackPixel, getCookie } from "./MetaPixel";

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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [product, setProduct] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  // Mahsulot kartochkasidagi "Tanlash" tugmasi shu yerga yozadi
  useEffect(() => {
    const handler = (e: Event) => setProduct((e as CustomEvent<string>).detail);
    window.addEventListener("select-product", handler);
    return () => window.removeEventListener("select-product", handler);
  }, []);

  const digits = phone.replace(/\D/g, "");
  const valid = name.trim().length >= 2 && digits.length === 12;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          product,
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
      trackPixel("Lead", { content_name: product || "MaryKids lid" }, eventId);
      setStatus("success");

      const channel = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL;
      if (channel) setTimeout(() => (window.location.href = channel), 1500);
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
        <p>Arizangiz qabul qilindi. Menejerimiz tez orada siz bilan bog'lanadi.</p>
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
      <p className="muted">Ismingiz va raqamingizni qoldiring — o'lcham va narxni aytib beramiz.</p>

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

      <label className="field">
        <span>Qaysi mahsulot qiziqtiradi?</span>
        <select value={product} onChange={(e) => setProduct(e.target.value)}>
          <option value="">Hali tanlamadim — maslahat kerak</option>
          {products.map((p) => (
            <option key={p.id} value={p.title}>
              {p.title} — {p.for}
            </option>
          ))}
        </select>
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

      <button className="btn btn-primary btn-block" disabled={!valid || status === "loading"}>
        {status === "loading" ? "Yuborilmoqda…" : "Buyurtma berish"}
      </button>
      <p className="tiny">🔒 Ma'lumotlaringiz uchinchi shaxslarga berilmaydi</p>
    </form>
  );
}
