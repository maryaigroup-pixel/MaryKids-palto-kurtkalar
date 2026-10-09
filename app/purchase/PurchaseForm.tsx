"use client";

import { useState } from "react";

const fmt = (n: string) => n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const quick = [720000, 760000, 890000, 1480000];

export default function PurchaseForm({
  token,
  needPin,
  defaultAmount,
}: {
  token: string;
  needPin: boolean;
  defaultAmount?: number;
}) {
  const [amount, setAmount] = useState(defaultAmount ? fmt(String(defaultAmount)) : "");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const raw = Number(amount.replace(/\D/g, ""));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (raw < 1000 || status === "loading") return;
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token, amount: raw, pin }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
      setStatus("success");
      setMsg(
        `${fmt(String(json.amountUzs))} so'm` +
          (json.currency === "USD" ? ` (≈ $${json.value})` : "") +
          " Purchase sifatida Meta'ga yuborildi."
      );
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Xatolik");
    }
  }

  if (status === "success") {
    return (
      <div className="success">
        <div className="success-icon">✓</div>
        <h3>Yuborildi!</h3>
        <p>{msg}</p>
        <p className="muted">Meta endi shu va shunga o'xshash xaridorlarga reklamani optimallashtiradi. Purchase va ROAS Ads Manager'da ko'rinadi.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="purchase-form">
      <label className="field">
        <span>To'lov summasi (so'm)</span>
        <input
          inputMode="numeric"
          placeholder="Masalan: 760 000"
          value={amount}
          onChange={(e) => setAmount(fmt(e.target.value))}
          autoFocus
          required
        />
      </label>
      <div className="quick">
        {quick.map((q) => (
          <button type="button" key={q} onClick={() => setAmount(fmt(String(q)))}>
            {fmt(String(q))}
          </button>
        ))}
      </div>
      {needPin && (
        <label className="field">
          <span>PIN kod</span>
          <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} />
        </label>
      )}
      {status === "error" && <p className="error">{msg}</p>}
      <button className="btn btn-primary btn-block btn-lg" disabled={raw < 1000 || status === "loading"}>
        {status === "loading" ? "Yuborilmoqda…" : "Yuborish → Meta Purchase"}
      </button>
    </form>
  );
}
