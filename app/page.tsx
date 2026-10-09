import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import ProductCard from "@/components/ProductCard";
import MetaPixel from "@/components/MetaPixel";
import { SelectionProvider } from "@/components/Selection";
import { products, formatSum, discountPercent } from "@/lib/products";

const features = [
  { icon: "❄️", title: "Qish uchun issiq", text: "Sifatli to'ldirgich va shamol o'tkazmaydigan mato" },
  { icon: "🏷", title: "40–45% chegirma", text: "Mavsum boshida eng arzon narxlar" },
  { icon: "🏬", title: "Onlayn va do'konda", text: "Buyurtma bering yoki MaryKids do'konimizga keling" },
  { icon: "🚚", title: "Tez yetkazib berish", text: "Toshkent bo'ylab 1 kun, viloyatlarga 2–3 kun" },
];

const steps = [
  { n: "1", t: "Mahsulot va rangni tanlang", d: "Yoqqan okoshkadagi «Tanlash» tugmasini bosing" },
  { n: "2", t: "Ism va raqamingizni qoldiring", d: "Menejer o'lchamni aniqlab, siz bilan bog'lanadi" },
  { n: "3", t: "Qabul qiling", d: "Kiyimni ko'rib, yoqsa to'laysiz" },
];

export default function Home() {
  return (
    <main>
      <header className="nav container">
        <div className="logo">
          Mary<span>Kids</span>
        </div>
        <a href="#buyurtma" className="btn btn-small btn-primary">
          Buyurtma berish
        </a>
      </header>

      {/* HERO */}
      <section className="hero container">
        <div className="hero-text">
          <span className="eyebrow">❄️ Yangi qishki kolleksiya · −45% gacha</span>
          <h1>
            Qizingiz va o'g'lingiz uchun <em>eng chiroyli</em> palto, kurtka va shapkalarni
            xarid qiling
          </h1>
          <p className="lead">
            MaryKids onlayn va offlayn do'koni — issiq, sifatli va zamonaviy kiyimlar. Farzandingiz
            qish bo'yi chiroyli va shamollamasdan yursin.
          </p>
          <div className="hero-cta">
            <a href="#kolleksiya" className="btn btn-primary btn-lg">
              Rangini tanlash →
            </a>
            <a href="#buyurtma" className="btn btn-ghost btn-lg">
              Buyurtma berish
            </a>
          </div>
          <ul className="hero-proof">
            <li>
              <strong>720 000</strong> so'mdan kurtkalar
            </li>
            <li>
              <strong>−45%</strong> chegirma
            </li>
            <li>
              <strong>1 kun</strong> yetkazish
            </li>
          </ul>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-a">
            <Image src="/products/qizlar-kurtka-bordo.svg" alt="Qizlar kurtkasi" fill priority unoptimized sizes="300px" />
            <span>Qizlar uchun</span>
          </div>
          <div className="hero-card hero-card-b">
            <Image src="/products/ogil-kurtka-boss.svg" alt="O'g'il bolalar kurtkasi" fill priority unoptimized sizes="300px" />
            <span>O'g'il bolalar uchun</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features container">
        {features.map((f) => (
          <div className="feature" key={f.title}>
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <SelectionProvider>
        {/* KATALOG — har bir mahsulot alohida qator, har rang alohida okoshka */}
        <section id="kolleksiya" className="section container">
          <div className="section-head">
            <h2>Qishki kolleksiya</h2>
            <p>Mahsulot va rangni tanlang — keyin buyurtma qoldiring</p>
          </div>

          {products.map((p) => {
            const off = discountPercent(p);
            return (
              <div className="row" key={p.id}>
                <div className="row-head">
                  <div>
                    <h3>{p.title}</h3>
                    <p>
                      {p.subtitle} · {p.variants.length} xil {p.variantLabel ? "model" : "rang"}
                    </p>
                  </div>
                  <div className="row-price">
                    {p.price ? (
                      <>
                        {p.oldPrice && <s>{formatSum(p.oldPrice)}</s>}
                        <strong>{formatSum(p.price)}</strong>
                        {off > 0 && <span className="row-off">−{off}%</span>}
                      </>
                    ) : (
                      <strong className="ask">Narxini so'rang</strong>
                    )}
                  </div>
                </div>
                <div className="grid">
                  {p.variants.map((v) => (
                    <ProductCard key={v.id} p={p} v={v} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* STEPS + FORM */}
        <section id="buyurtma" className="order section">
          <div className="container order-inner">
            <div className="order-text">
              <h2>
                Farzandingizni bu qish <em>eng chiroyli</em> qilib kiyintiring
              </h2>
              <p className="lead">Chegirmali narxlar cheklangan miqdorda. Arizangizni hoziroq qoldiring.</p>
              <ol className="steps">
                {steps.map((s) => (
                  <li key={s.n}>
                    <span>{s.n}</span>
                    <div>
                      <strong>{s.t}</strong>
                      <p>{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <LeadForm />
          </div>
        </section>
      </SelectionProvider>

      <footer className="footer container">
        <div className="logo">
          Mary<span>Kids</span>
        </div>
        <p>© {new Date().getFullYear()} MaryKids — bolalar kiyimlari onlayn va offlayn do'koni.</p>
      </footer>

      <a href="#kolleksiya" className="sticky-cta btn btn-primary">
        Rangini tanlash
      </a>

      {/* Pixel faqat landingda — admin purchase sahifasi statistikani buzmasligi uchun */}
      <MetaPixel />
    </main>
  );
}
