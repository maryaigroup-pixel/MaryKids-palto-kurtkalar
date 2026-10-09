export type Variant = {
  id: string;
  color: string; // rang nomi (Telegram'da ko'rinadi)
  hex: string; // rang doirachasi uchun
  image: string;
};

export type Product = {
  id: string;
  title: string;
  subtitle: string;
  category: "Palto" | "Kurtka" | "Shapka";
  for: "Qizlar" | "O'g'il bolalar" | "Hammaga";
  variantLabel?: string; // Telegram'da "Rang" o'rniga (masalan "Brend")
  price?: number; // so'mda. Bo'lmasa "Narxini so'rang" chiqadi
  oldPrice?: number;
  variants: Variant[];
};

const v = (productId: string, id: string, color: string, hex: string): Variant => ({
  id,
  color,
  hex,
  image: `/products/${productId}-${id}.svg`,
});

/**
 * MaryKids katalogi. Har bir rang saytda alohida "okoshka" (karta) bo'lib chiqadi.
 * Haqiqiy suratlarni public/products/ ga joylab, image yo'lini almashtiring
 * (masalan: "/products/palto-oq.jpg").
 */
export const products: Product[] = [
  {
    id: "palto",
    title: "Palto",
    subtitle: "Kashemir aralash, issiq astar",
    category: "Palto",
    for: "Hammaga",
    price: 760_000,
    oldPrice: 1_360_000,
    variants: [
      v("palto", "oq", "Oq", "#f3efe8"),
      v("palto", "seriy", "Seriy", "#8e9196"),
      v("palto", "qora", "Qora", "#232326"),
      v("palto", "choco", "Choco", "#5a3a28"),
    ],
  },
  {
    id: "qizlar-kurtka",
    title: "Qizlar kurtkasi",
    subtitle: "Puxovik, mo'ynali kapyushon",
    category: "Kurtka",
    for: "Qizlar",
    price: 720_000,
    oldPrice: 1_320_000,
    variants: [
      v("qizlar-kurtka", "oq", "Oq", "#f3efe8"),
      v("qizlar-kurtka", "choco", "Choco", "#5a3a28"),
      v("qizlar-kurtka", "bordo", "Bordo", "#7a1f33"),
    ],
  },
  {
    id: "ogil-kurtka",
    title: "O'g'il bolalar kurtkasi",
    subtitle: "Brend kolleksiya",
    variantLabel: "Brend",
    category: "Kurtka",
    for: "O'g'il bolalar",
    price: 890_000,
    oldPrice: 1_480_000,
    variants: [
      v("ogil-kurtka", "dolce-gabbana", "Dolce & Gabbana", "#1b1b1e"),
      v("ogil-kurtka", "boss", "Boss", "#2c3a52"),
    ],
  },
  {
    id: "shapka-on-cloud",
    title: "On Cloud shapka",
    subtitle: "Yumshoq trikotaj",
    category: "Shapka",
    for: "Hammaga",
    variants: [
      v("shapka-on-cloud", "oq", "Oq", "#f3efe8"),
      v("shapka-on-cloud", "seriy", "Seriy", "#8e9196"),
      v("shapka-on-cloud", "bejeviy", "Bejeviy", "#d8c3a0"),
      v("shapka-on-cloud", "qora", "Qora", "#232326"),
    ],
  },
  {
    id: "shapka-prada",
    title: "Prada shapka",
    subtitle: "Issiq trikotaj",
    category: "Shapka",
    for: "Hammaga",
    variants: [
      v("shapka-prada", "oq", "Oq", "#f3efe8"),
      v("shapka-prada", "qora", "Qora", "#232326"),
      v("shapka-prada", "seriy", "Seriy", "#8e9196"),
      v("shapka-prada", "toq-jigarrang", "To'q jigarrang", "#4a2e20"),
    ],
  },
];

export function formatSum(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n).replace(/ |\s/g, " ") + " so'm";
}

export function discountPercent(p: Product) {
  if (!p.price || !p.oldPrice) return 0;
  return Math.round((1 - p.price / p.oldPrice) * 100);
}

/** "palto:oq" ko'rinishidagi kalit */
export const selectionKey = (productId: string, variantId: string) => `${productId}:${variantId}`;

export function findSelection(key: string | undefined) {
  if (!key) return null;
  const [pid, vid] = key.split(":");
  const product = products.find((p) => p.id === pid);
  const variant = product?.variants.find((x) => x.id === vid);
  if (!product || !variant) return null;
  return { product, variant, key: selectionKey(product.id, variant.id) };
}

/** Telegram va Meta uchun matn: "Palto — Oq" */
export function selectionLabel(key: string | undefined) {
  const s = findSelection(key);
  return s ? `${s.product.title} — ${s.variant.color}` : "";
}
