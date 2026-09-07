/** Diş kavsinden soyutlanmış, ince çizgili dekoratif kompozisyon. */
export default function ArcVisual({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 520"
      fill="none"
      aria-hidden
      className={`h-full w-full ${className}`}
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor="#a8e6c9" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#a8e6c9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#a8e6c9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f2e25" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0f2e25" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <circle cx="260" cy="250" r="230" fill="url(#glow)" />

      {[210, 176, 142, 108, 74].map((r, i) => (
        <path
          key={r}
          d={`M ${260 - r} 250 A ${r} ${r * 0.92} 0 0 0 ${260 + r} 250`}
          stroke="url(#line)"
          strokeWidth={i === 0 ? 1.4 : 1}
          strokeLinecap="round"
          style={{
            strokeDasharray: 1400,
            strokeDashoffset: 1400,
            animation: `draw 2.2s var(--ease-out-expo) forwards`,
            animationDelay: `${0.4 + i * 0.14}s`,
          }}
        />
      ))}

      {[...Array(11)].map((_, i) => {
        const angle = Math.PI + (Math.PI / 10) * i;
        const x = 260 + Math.cos(angle) * 196;
        const y = 250 + Math.sin(angle) * 180;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === 5 ? 5 : 2.5}
            className="fill-forest"
            opacity={i === 5 ? 0.9 : 0.35}
            style={{ animation: `fade 1s ease forwards`, animationDelay: `${1 + i * 0.06}s`, opacity: 0 }}
          />
        );
      })}

      <style>{`
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes fade { to { opacity: 1; } }
      `}</style>
    </svg>
  );
}
