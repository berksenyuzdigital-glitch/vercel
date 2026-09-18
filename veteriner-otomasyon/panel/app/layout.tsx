import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "PatiKlinik Paneli",
  description: "Veteriner kliniği için stok, kaçak, cari ve koruyucu hekimlik takibi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
