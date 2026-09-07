import { clinic } from "@/lib/clinic";

export default function Footer() {
  return (
    <footer data-nav="dark" className="relative overflow-hidden bg-ink pt-24 text-bone">
      <div className="shell">
        <div className="grid gap-12 border-b hairline-light pb-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-mint/60">İletişim</p>
            <a
              href={clinic.phoneHref}
              className="display mt-6 block text-4xl transition-colors hover:text-mint md:text-5xl"
            >
              {clinic.phone}
            </a>
            <a
              href={`mailto:${clinic.mail}`}
              className="link-line mt-4 inline-block text-lg text-bone/70"
            >
              {clinic.mail}
            </a>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="eyebrow text-mint/60">Adres</p>
            <p className="mt-6 text-base leading-relaxed text-bone/70">{clinic.address}</p>
            <a
              href="https://maps.google.com/?q=Tesvikiye+Caddesi+Nisantasi+Istanbul"
              target="_blank"
              rel="noreferrer"
              className="link-line mt-4 inline-block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-mint"
            >
              Haritada aç ↗
            </a>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow text-mint/60">Çalışma Saatleri</p>
            <ul className="mt-6 space-y-3 text-sm">
              {clinic.hours.map((row) => (
                <li key={row.day} className="flex justify-between gap-4 text-bone/70">
                  <span>{row.day}</span>
                  <span className="font-mono text-xs text-bone/50">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 py-8">
          <ul className="flex flex-wrap gap-6">
            {clinic.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="link-line font-mono text-[0.68rem] uppercase tracking-[0.18em] text-bone/60"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>

          <a href="#top" className="link-line font-mono text-[0.68rem] uppercase tracking-[0.18em] text-bone/60">
            Yukarı ↑
          </a>
        </div>
      </div>

      <div className="shell overflow-hidden">
        <p className="display -ml-[0.04em] select-none whitespace-nowrap text-[clamp(4rem,30vw,26rem)] leading-[0.78] text-bone/90">
          AUREA<span className="text-mint">.</span>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t hairline-light py-6">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-bone/35">
            © {new Date().getFullYear()} {clinic.name} {clinic.tagline} — Tüm hakları saklıdır.
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-bone/35">
            KVKK · Aydınlatma Metni · Çerez Politikası
          </p>
        </div>
      </div>
    </footer>
  );
}
