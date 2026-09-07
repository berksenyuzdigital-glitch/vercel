"use client";

import { useRef, type ReactNode } from "react";

/** İmleç yaklaştıkça çocuğunu hafifçe kendine çeken sarmalayıcı. */
export default function Magnetic({
  children,
  strength = 0.32,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const handleMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    const node = ref.current;
    if (!node || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (event.clientY - (rect.top + rect.height / 2)) * strength;
    node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
  };

  return (
    <span
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={`inline-block will-change-transform transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] ${className}`}
    >
      {children}
    </span>
  );
}
