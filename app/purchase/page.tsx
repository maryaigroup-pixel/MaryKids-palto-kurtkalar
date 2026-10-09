import type { Metadata } from "next";
import { unseal, type LeadToken } from "@/lib/crypto";
import PurchaseForm from "./PurchaseForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Xaridni tasdiqlash — MaryKids",
  robots: { index: false, follow: false },
};

export default async function PurchasePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const lead = t ? unseal<LeadToken>(t) : null;

  return (
    <main className="purchase-wrap">
      <div className="purchase-card">
        <div className="logo">
          Mary<span>Kids</span>
        </div>
        {!lead || !t ? (
          <>
            <h1>Havola yaroqsiz</h1>
            <p className="muted">Bu havola buzilgan yoki noto'g'ri. Telegram'dagi lid havolasini qayta oching.</p>
          </>
        ) : (
          <>
            <h1>Xaridni Meta'ga yuborish</h1>
            <div className="lead-info">
              <div>
                <span>Mijoz</span>
                <strong>{lead.mp}</strong>
              </div>
              {lead.pr && (
                <div>
                  <span>Mahsulot</span>
                  <strong>{lead.pr}</strong>
                </div>
              )}
              <div>
                <span>Lid vaqti</span>
                <strong>
                  {new Intl.DateTimeFormat("ru-RU", {
                    timeZone: "Asia/Tashkent",
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(lead.ts * 1000))}
                </strong>
              </div>
              <div>
                <span>Ma'lumotlar</span>
                <strong>🔐 SHA-256 xeshlangan</strong>
              </div>
            </div>
            <PurchaseForm token={t} needPin={Boolean(process.env.ADMIN_PIN)} defaultAmount={lead.pv} />
          </>
        )}
      </div>
    </main>
  );
}
