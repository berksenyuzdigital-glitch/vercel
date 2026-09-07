"use client";

import { useEffect, useState } from "react";
import Magnetic from "./Magnetic";

const LINKS = [
  { label: "Klinik", href: "#klinik" },
  { label: "Tedaviler", href: "#tedaviler" },
  { label: "Ekip", href: "#ekip" },
  { label: "Süreç", href: "#surec" },
  { label: "Sorular", href: "#sorular" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Üst kenarı hangi bölüm kesiyorsa nav rengini ona göre çevirir. */
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-nav]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setDark(entry.target.getAttribute("data-nav") === "dark");
        });
      },
      { rootMargin: "-72px 0px -100% 0px", threshold: 0 },
    );
    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const tone = dark ? "text-bone" : "text-ink";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled && !open
            ? dark
              ? "border-b border-bone/10 bg-forest/85 backdrop-blur-xl"
              : "border-b border-ink/10 bg-bone/85 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        <nav className="shell flex h-[72px] items-center justify-between gap-6">
          <a
            href="#top"
            className={`font-display text-2xl leading-none tracking-tight transition-colors duration-500 ${
              open ? "text-bone" : tone
            }`}
          >
            AUREA<span className="text-clay">.</span>
          </a>

          <ul className={`hidden items-center gap-9 lg:flex ${tone}`}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="link-line font-mono text-[0.7rem] uppercase tracking-[0.18em] opacity-70 transition-opacity hover:opacity-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block">
              <Magnetic>
                <a href="#randevu" className={`btn ${dark ? "btn-light" : "btn-solid"} !py-3 !px-6`}>
                  Randevu Al
                  <span aria-hidden>↗</span>
                </a>
              </Magnetic>
            </span>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              className={`grid h-11 w-11 place-items-center rounded-full border transition-colors duration-500 lg:hidden ${
                open ? "border-bone/30 text-bone" : dark ? "border-bone/25 text-bone" : "border-ink/20 text-ink"
              }`}
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 h-px w-full bg-current transition-all duration-500 [transition-timing-function:var(--ease-out-expo)] ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 h-px w-full bg-current transition-all duration-500 [transition-timing-function:var(--ease-out-expo)] ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobil tam ekran menü */}
      <div
        className={`fixed inset-0 z-40 bg-forest px-6 pb-10 pt-24 text-bone transition-[clip-path] duration-[900ms] [transition-timing-function:var(--ease-in-out-quint)] lg:hidden ${
          open ? "[clip-path:inset(0_0_0%_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <ul className="flex flex-col gap-2">
          {LINKS.map((link, i) => (
            <li key={link.href} className="overflow-hidden">
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="display fluid-lg block py-2 transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)]"
                style={{
                  transform: open ? "none" : "translateY(110%)",
                  transitionDelay: `${open ? 120 + i * 60 : 0}ms`,
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#randevu"
          onClick={() => setOpen(false)}
          className="btn btn-light mt-10 w-full justify-center"
        >
          Randevu Al ↗
        </a>
      </div>
    </>
  );
}
