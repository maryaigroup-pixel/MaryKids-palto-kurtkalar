"use client";

import Image from "next/image";
import { type Product, type Variant, formatSum, discountPercent, selectionKey } from "@/lib/products";
import { trackPixel } from "./MetaPixel";
import { useSelection } from "./Selection";

/** Bitta rang = bitta okoshka */
export default function ProductCard({ p, v }: { p: Product; v: Variant }) {
  const { selected, setSelected } = useSelection();
  const key = selectionKey(p.id, v.id);
  const active = selected === key;
  const off = discountPercent(p);

  function choose() {
    setSelected(key);
    trackPixel("ViewContent", {
      content_ids: [key],
      content_name: `${p.title} — ${v.color}`,
      content_category: p.category,
      content_type: "product",
      ...(p.price ? { value: p.price, currency: "UZS" } : {}),
    });
    setTimeout(() => document.getElementById("buyurtma")?.scrollIntoView({ behavior: "smooth" }), 150);
  }

  return (
    <article className={`product${active ? " is-active" : ""}`} onClick={choose}>
      <div className="product-img">
        <Image
          src={v.image}
          alt={`${p.title} — ${v.color}`}
          fill
          unoptimized={v.image.endsWith(".svg")}
          sizes="(max-width: 700px) 50vw, 25vw"
        />
        {off > 0 && <span className="badge">-{off}%</span>}
        {active && <span className="check">✓</span>}
      </div>
      <div className="product-body">
        <span className="color">
          <i style={{ background: v.hex }} />
          {v.color}
        </span>
        <h3>{p.title}</h3>
        <div className="price">
          {p.price ? (
            <>
              <strong>{formatSum(p.price)}</strong>
              {p.oldPrice && <s>{formatSum(p.oldPrice)}</s>}
            </>
          ) : (
            <strong className="ask">Narxini so'rang</strong>
          )}
        </div>
        <button
          type="button"
          className={`btn btn-block ${active ? "btn-primary" : "btn-outline"}`}
          onClick={(e) => {
            e.stopPropagation();
            choose();
          }}
        >
          {active ? "✓ Tanlandi" : "Tanlash"}
        </button>
      </div>
    </article>
  );
}
