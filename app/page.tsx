import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import MetaPixel from "@/components/MetaPixel";

const features = [
  { icon: "❄️", title: "-25°C gacha issiq", text: "Sifatli to'ldirgich va shamol o'tkazmaydigan mato" },
  { icon: "🧵", title: "Yuqori sifat", text: "Mustahkam tikuv, yumshoq astar, bolaga qulay" },
  { icon: "📏", title: "2 yoshdan 14 yoshgacha", text: "O'lchamni tanlashda bepul maslahat beramiz" },
  { icon: "🚚", title: "Tez yetkazib berish", text: "Toshkent bo'ylab 1 kun, viloyatlarga 2–3 kun" },
];

const steps = [
  { n: "1", t: "Ariza qoldiring", d: "Ism va telefon raqamingizni yozing" },
  { n: "2", t: "Maslahat oling", d: "Menejer o'lcham va rangni tanlashga yordam beradi" },
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
          <span className="eyebrow">❄️ Yangi qishki kolleksiya 2026</span>
          <h1>
            Qizingiz va o'g'lingiz uchun <em>eng chiroyli</em> palto, kurtka va shapkalarni
            xarid qiling
          </h1>
          <p className="lead">
            Issiq, sifatli va zamonaviy — farzandingiz qish bo'yi chiroyli va shamollamasdan
            yursin.
          </p>
          <div className="hero-cta">
            <a href="#buyurtma" className="btn btn-primary btn-lg">
              Hoziroq buyurtma berish →
            </a>
            <a href="#kolleksiya" className="btn btn-ghost btn-lg">
              Kolleksiyani ko'rish
            </a>
          </div>
          <ul className="hero-proof">
            <li>
              <strong>5 000+</strong> xursand oila
            </li>
            <li>
              <strong>-20%</strong> chegirma
            </li>
            <li>
              <strong>1 kun</strong> yetkazish
            </li>
          </ul>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-a">
            <Image src="/products/palto-qiz.svg" alt="Qizlar uchun palto" fill priority unoptimized sizes="300px" />
            <span>Qizlar uchun</span>
          </div>
          <div className="hero-card hero-card-b">
            <Image src="/products/kurtka-ogil.svg" alt="O'g'il bolalar uchun kurtka" fill priority unoptimized sizes="300px" />
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

      {/* PRODUCTS */}
      <section id="kolleksiya" className="section container">
        <div className="section-head">
          <h2>Qishki kolleksiya</h2>
          <p>Yoqqan modelni tanlang — qolganini o'zimiz hal qilamiz</p>
        </div>
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* STEPS + FORM */}
      <section id="buyurtma" className="order section">
        <div className="container order-inner">
          <div className="order-text">
            <h2>
              Farzandingizni bu qish <em>eng chiroyli</em> qilib kiyintiring
            </h2>
            <p className="lead">Chegirma cheklangan miqdorda. Arizangizni hoziroq qoldiring.</p>
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

      <footer className="footer container">
        <div className="logo">
          Mary<span>Kids</span>
        </div>
        <p>© {new Date().getFullYear()} MaryKids. Bolalar uchun qishki kiyimlar.</p>
      </footer>

      <a href="#buyurtma" className="sticky-cta btn btn-primary">
        Buyurtma berish
      </a>
      {/* Pixel faqat landingda — admin purchase sahifasi statistikani buzmasligi uchun */}
      <MetaPixel />
    </main>
  );
}
