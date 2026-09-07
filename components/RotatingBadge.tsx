export default function RotatingBadge({
  text = "ONLINE RANDEVU · 7/24 AÇIK · ",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <svg viewBox="0 0 200 200" className="h-full w-full animate-[spin_22s_linear_infinite]">
        <defs>
          <path
            id="badge-arc"
            d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"
            fill="none"
          />
        </defs>
        <text className="fill-current font-mono text-[12.5px] uppercase tracking-[0.18em]">
          <textPath href="#badge-arc">{text}</textPath>
        </text>
      </svg>
      <span className="absolute text-2xl" aria-hidden>
        ↓
      </span>
    </div>
  );
}
