---
name: premium-3d-landing-page
description: Director-level framework for premium 3D landing pages and interactive 3D web experiences — a 3D hero, product visualization, or spatial/creative frontend built with Three.js/WebGL/R3F. Use when the user wants a 3D landing page, 3D hero section, interactive 3D product presentation, or a "premium"/"Awwwards-level" site that needs an actual 3D system, not just decorative motion. Not for ordinary pages without a real 3D requirement — pair with design-taste for the taste layer and scroll-motion-performance-accessibility for the QA pass.
---

# Premium 3D Landing Page Director

A structure for projects where 3D is load-bearing to the concept — not decoration. Produce all 15 sections below before implementation starts; skipping straight to code on a 3D-heavy page is how generic "AI 3D slop" happens (spinning object, no story, decorative fog).

Mobile is a separate composition, not a shrunk desktop — call this out explicitly in section 11.

## The 15 deliverables

1. **Project Positioning** — what is this site for, who is it for, what should the 3D communicate that flat design couldn't.
2. **Reference Synthesis** — what references were studied (if any), what to keep, what to adapt, what not to copy verbatim (branding/copy/proprietary assets never copied).
3. **Original Art Direction** — the specific, decided visual language (not "modern and clean") — palette, material language, lighting mood, one physical-scene sentence justifying it.
4. **Page Architecture** — section order and rationale.
5. **Design Foundations** — type scale, color tokens, spacing scale, radius system — reuse the project's existing tokens if any exist; don't invent a parallel system.
6. **Hero Specification** — exact composition: what's 3D, what's DOM/text, how they layer, what's visible without scrolling.
7. **3D System** — see the 3D specifics below; this is the technical spec, not just "Three.js hero."
8. **Section Specifications** — per non-hero section: layout, content, any motion/3D carried through.
9. **Motion Choreography** — what moves, why (see scroll-motion-performance-accessibility for the QA side), and how scroll position maps to 3D/camera state.
10. **Component System** — reusable pieces (buttons, cards, nav) and their states.
11. **Responsive Behavior** — mobile's *independent* composition: what simplifies, what's cut, what replaces the 3D scene if it's cut entirely.
12. **Production Stack** — the actual chosen libraries (Three.js vs R3F, GSAP vs native, Lenis or not) and why, matched to the "Motion / Scroll Engineering Standard" decision table (micro-interaction → CSS/Motion; complex timeline → GSAP; scroll storytelling → GSAP+ScrollTrigger; 3D scene → Three.js/R3F; shader scene → raw WebGL).
13. **Performance & Accessibility** — hand off to `scroll-motion-performance-accessibility` for the actual QA pass; note here the specific budget for this project (target FPS, DPR clamp, texture budget).
14. **Anti-Generic QA** — run the AI-slop checks from `design-taste`'s anti-slop reference against this page specifically.
15. **Final QA** — sign-off checklist before shipping.

## 3D specifics (fill in as part of section 7)

- **Camera** — FOV, position, movement (fixed, scroll-driven, mouse-parallax, orbit).
- **Lens** — depth of field, focal behavior, any post-processing (bloom, chromatic aberration) and why.
- **Material** — PBR values or stylized shader approach; consistency across all 3D objects in the scene.
- **Lighting** — key/fill/rim setup or environment map choice; matches the art direction's mood.
- **Background** — solid, gradient, environment, or procedural — and how it interacts with the 3D subject.
- **Composition** — where the 3D subject sits relative to text/UI at each breakpoint.
- **Aspect ratio** — how the 3D canvas's aspect ratio is handled across viewport sizes.
- **Asset continuity** — consistent style/scale/material across every 3D asset in the scene, not mixed-fidelity assets.
- **Fallback** — what renders when WebGL is unavailable or the device can't sustain the scene (a static image/video is not a failure, it's a decision to make explicitly).
- **Loading strategy** — what shows while assets/shaders load; never a blank canvas or unstyled flash.

## The 3D-meaning rule

Every 3D element must connect to brand, product, story, or interaction — never present purely because 3D "looks premium." If you can't state in one sentence what the 3D communicates that a flat hero couldn't, cut it or rework it.

## Handoff

- Art direction and taste calls → `design-taste`.
- Scroll/motion/WebGL performance and accessibility verification → `scroll-motion-performance-accessibility`.
- Final visual/interaction correctness in a real browser → Playwright screenshot pass (see project `CLAUDE.md`).
