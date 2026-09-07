import type { Metadata, Viewport } from "next";
import "./globals.css";
import Cursor from "@/components/Cursor";
import RevealProvider from "@/components/RevealProvider";
import Preloader from "@/components/Preloader";

export const metadata: Metadata = {
  metadataBase: new URL("https://aureadental.vercel.app"),
  title: {
    default: "AUREA — Dental Atelier | Nişantaşı Diş Kliniği",
    template: "%s · AUREA Dental Atelier",
  },
  description:
    "Dijital gülüş tasarımı, implantoloji ve şeffaf plak ortodontisi. Nişantaşı'nda randevulu, tek hekim sorumluluğunda çalışan butik diş kliniği.",
  keywords: [
    "diş kliniği",
    "gülüş tasarımı",
    "implant",
    "şeffaf plak",
    "Nişantaşı diş hekimi",
    "online randevu",
  ],
  openGraph: {
    title: "AUREA — Dental Atelier",
    description:
      "Dijital muayene, tasarım seansı ve tek hekim sorumluluğu. Randevunuzu 60 saniyede oluşturun.",
    locale: "tr_TR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f2e25",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Preloader />
        <Cursor />
        <RevealProvider />
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
