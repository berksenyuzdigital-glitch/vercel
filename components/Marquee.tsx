const ITEMS = [
  "Gülüş Tasarımı",
  "İmplantoloji",
  "Şeffaf Plak",
  "Zirkonyum",
  "Bonding",
  "Beyazlatma",
  "Pedodonti",
  "Kanal Tedavisi",
];

export default function Marquee() {
  return (
    <div data-nav="dark" className="marquee-wrap overflow-hidden bg-forest py-5 text-bone">
      <div className="marquee items-center gap-10 pr-10">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={`${item}-${i}`} className="flex shrink-0 items-center gap-10">
            <span className="font-display text-2xl md:text-3xl">{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
