---
name: scroll-motion-performance-accessibility
description: QA pass for scroll-driven animation, motion performance, and accessibility. Use when building or reviewing anything with scroll-triggered animation, pinned/sticky sections, parallax, GSAP ScrollTrigger, Lenis smooth scroll, image-sequence scrubbing, video scrubbing, or WebGL/Three.js scenes tied to scroll — or when a motion-heavy page feels janky, drops frames, breaks keyboard/wheel scrolling, or needs a mobile-stability and reduced-motion audit.
---

# Scroll, Motion Performance & Accessibility QA

A verification pass for scroll-driven and motion-heavy interfaces. Design taste decides *what* should happen; this skill checks *whether it actually holds up* — input safety, frame budget, and accessibility on real devices.

Run this after implementing scroll/motion work, or when auditing existing motion, and report as a pass/fail checklist grouped by section below.

## Input safety
- No wheel-hijacking: native scroll always wins unless a pin is deliberately active and released cleanly.
- Keyboard scroll (arrows, Page Up/Down, Space, Home/End) must keep working through any custom scroll engine.
- Anchor links and browser history (back/forward, hash navigation) survive the scroll engine intact.
- No forced-scroll loops — a page must never fight the user's scroll direction or re-trigger a pin repeatedly.

## Performance
- Animate `transform` and `opacity` only. Anything touching `width`/`height`/`top`/`left`/`margin`/`padding` on scroll is a rewrite target.
- No layout thrashing: don't interleave reads (`getBoundingClientRect`, `offsetTop`) and writes inside a scroll/rAF handler — batch reads, then write.
- Split-text/char-by-char animations must not explode the DOM (thousands of spans) — cap scope to what's actually animated.
- Every scroll-linked animation loop must be bounded: killed/paused when its trigger leaves the viewport, not running forever in the background.

## Image sequences (scroll-scrubbed frames)
- Frames are right-sized for their rendered dimensions, not shipped at source resolution.
- Render via `<canvas>`, not swapping hundreds of `<img>` elements.
- Preload progressively (a small lead buffer, not the entire sequence) with a bounded in-memory cache.
- Reduce frame count/resolution on mobile — the same sequence at desktop density is a common mobile-perf failure.

## Video (scroll-scrubbed or autoplay)
- Poster image shown before any frame decodes.
- Scrubbing is tested at multiple scroll speeds, not just a slow demo pass.
- Encoding/bitrate matches how the video is actually displayed (size, duration) — don't ship a 4K master for a 400px hero loop.
- No offscreen video left decoding/playing when scrolled out of view.

## WebGL / Three.js budgeting
- Prefer a single shared canvas over multiple independent WebGL contexts.
- Clamp device pixel ratio (typically ≤2) — uncapped DPR on high-density mobile screens tanks frame rate for no visible gain.
- Compressed textures and right-sized geometry; use instancing where the scene repeats objects.
- Reduce shader/particle complexity on mobile rather than shipping the desktop scene unchanged.
- Pause the render loop when the canvas is scrolled offscreen or the tab is backgrounded.

## Mobile stability
Verify on real device classes, not just a resized desktop viewport:
- iOS Safari and Android Chrome specifically (they diverge on scroll/inertia/viewport behavior).
- Touch inertia scrolling feels native, not fighting a custom engine.
- Dynamic viewport units (`100dvh` etc.) used where `100vh` would jump on mobile browser chrome show/hide.
- Orientation change doesn't break layout or restart animations badly.
- No horizontal overflow anywhere in the scroll journey.
- Sustained motion/WebGL doesn't trigger visible thermal throttling on mid-tier devices.

## Accessibility
- Semantic heading order preserved regardless of visual/scroll layout.
- Every interactive element stays keyboard-reachable in document order.
- Focus rings stay visible; never `outline: none` without a `:focus-visible` replacement.
- Contrast holds during animated/transitioning states, not just the static end frame.
- `prefers-reduced-motion` gets a real fallback: crossfade or instant state change, keeping any information the motion was conveying.
- Images and canvas-rendered visuals have real alt text; no essential content exists *only* inside a canvas or WebGL scene.

## Reporting
Output a checklist per section (pass / fail / n/a) with a one-line reason for each fail, plus the fix applied — not a prose summary. Skip only when the change genuinely touches none of these areas (e.g., a pure copy edit).
