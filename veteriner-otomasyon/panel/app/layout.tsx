import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Kenar from "@/components/Kenar";

export const metadata: Metadata = {
  title: "PatiKlinik — Veteriner Klinik Paneli",
  description: "Stok, cari, kaçak takibi ve koruyucu hekimlik takvimi tek panelde.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <StoreProvider>
          <div className="flex min-h-screen">
            <Kenar />
            <main className="flex-1 min-w-0 px-8 py-7 max-w-[1500px]">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
