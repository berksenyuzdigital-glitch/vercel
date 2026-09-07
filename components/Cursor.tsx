"use client";

import { useEffect, useRef } from "react";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const eased = { ...target };
    let frame = 0;

    const move = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }
      const interactive = (event.target as HTMLElement)?.closest(
        "a, button, [data-cursor], input, select, textarea",
      );
      ring.current?.setAttribute("data-hover", interactive ? "true" : "false");
    };

    const loop = () => {
      eased.x += (target.x - eased.x) * 0.14;
      eased.y += (target.y - eased.y) * 0.14;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${eased.x}px, ${eased.y}px, 0)`;
      }
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", move, { passive: true });
    frame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
