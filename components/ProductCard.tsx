"use client";

import Image from "next/image";
import type { Product } from "@/lib/products";
import { trackPixel } from "./MetaPixel";

export default function ProductCard({ p }: { p: Product }) {
  function choose() {
    window.dispatchEvent(new CustomEvent("select-product", { detail: p.title }));
    trackPixel("ViewContent", { content_name: p.title, content_category: p.category });
    document.getElementById("buyurtma")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <article className="product">
      <div className="product-img">
        <Image src={p.image} alt={p.title} fill unoptimized={p.image.endsWith(".svg")} sizes="(max-width: 700px) 50vw, 33vw" />
        {p.badge && <span className="badge">{p.badge}</span>}
      </div>
      <div className="product-body">
        <span className="chip">
          {p.category} · {p.for}
        </span>
        <h3>{p.title}</h3>
        <div className="price">
          <strong>{p.price}</strong>
          {p.oldPrice && <s>{p.oldPrice}</s>}
        </div>
        <button className="btn btn-outline btn-block" onClick={choose}>
          Tanlash
        </button>
      </div>
    </article>
  );
}
