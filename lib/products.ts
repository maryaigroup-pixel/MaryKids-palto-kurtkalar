export type Product = {
  id: string;
  title: string;
  category: "Palto" | "Kurtka" | "Shapka";
  for: "Qizlar" | "O'g'il bolalar" | "Hammaga";
  price: string;
  oldPrice?: string;
  image: string;
  badge?: string;
};

/**
 * Mahsulotlar ro'yxati.
 * Haqiqiy suratlarni public/products/ papkasiga joylab, "image" maydonini almashtiring
 * (masalan: "/products/qizil-palto.jpg").
 */
export const products: Product[] = [
  {
    id: "palto-qiz-bordo",
    title: "Kashemir palto «Malika»",
    category: "Palto",
    for: "Qizlar",
    price: "590 000 so'm",
    oldPrice: "750 000 so'm",
    image: "/products/palto-qiz.svg",
    badge: "Xit",
  },
  {
    id: "kurtka-ogil-navy",
    title: "Issiq kurtka «Arktika»",
    category: "Kurtka",
    for: "O'g'il bolalar",
    price: "520 000 so'm",
    oldPrice: "650 000 so'm",
    image: "/products/kurtka-ogil.svg",
    badge: "-20%",
  },
  {
    id: "kurtka-qiz-pink",
    title: "Puxovik kurtka «Bulut»",
    category: "Kurtka",
    for: "Qizlar",
    price: "540 000 so'm",
    image: "/products/kurtka-qiz.svg",
    badge: "Yangi",
  },
  {
    id: "palto-ogil-camel",
    title: "Klassik palto «Janob»",
    category: "Palto",
    for: "O'g'il bolalar",
    price: "610 000 so'm",
    image: "/products/palto-ogil.svg",
  },
  {
    id: "shapka-qiz",
    title: "Pompon shapka + sharf",
    category: "Shapka",
    for: "Qizlar",
    price: "150 000 so'm",
    image: "/products/shapka-qiz.svg",
  },
  {
    id: "shapka-ogil",
    title: "Trikotaj shapka «Polar»",
    category: "Shapka",
    for: "O'g'il bolalar",
    price: "130 000 so'm",
    image: "/products/shapka-ogil.svg",
  },
];
