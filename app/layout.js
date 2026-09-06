import "./globals.css";

export const metadata = {
  title: "LTX Video Stüdyo",
  description: "Fotoğraftan video üretme aracı",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
