import type { Metadata, Viewport } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = Nunito({ subsets: ["latin", "cyrillic"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "MaryKids — bolalar uchun palto, kurtka va shapkalar",
  description:
    "Qizingiz va o'g'lingiz uchun eng chiroyli palto, kurtka va shapkalar. Sifatli, issiq va zamonaviy. O'zbekiston bo'ylab yetkazib berish.",
  openGraph: {
    title: "MaryKids — bolalar uchun qishki kiyimlar",
    description: "Qizingiz va o'g'lingiz uchun eng chiroyli palto, kurtka va shapkalar.",
    type: "website",
    locale: "uz_UZ",
  },
};

export const viewport: Viewport = {
  themeColor: "#7a2e45",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${sans.variable} ${serif.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
