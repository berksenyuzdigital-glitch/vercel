# Project instructions

## Design system routing

Two design-related skills are installed, and they are not redundant — each has final say in a different domain:

| Skill | Owns | Triggers on |
|---|---|---|
| `design-taste` | Art direction, taste, typography, color, motion, layout, anti-AI-slop | Any design/build/polish/critique of a UI |
| `web-design-guidelines` | Correctness: accessibility, semantic HTML, keyboard/focus, forms, ARIA, `prefers-reduced-motion` | Reviewing/auditing UI code against best practices |
| `scroll-motion-performance-accessibility` | Scroll/motion QA: input safety, frame budget, image-sequence/video/WebGL performance, mobile stability | Anything with scroll-driven animation, pinning, parallax, or WebGL tied to scroll |
| `premium-3d-landing-page` | Structuring a real 3D landing page/hero (camera, lighting, materials, story) | Only when 3D is actually load-bearing to the page's concept |
| `visual-direction` | Technical camera/lens/projection/lighting/material/render-style vocabulary for any image, video, or 3D-scene prompt | Writing or reviewing an image/video/3D-generation prompt, a hero visual spec, a product/architectural render, or a technical diagram — replaces vague adjectives ("premium", "cinematic") with a decidable spec |

If `design-taste` and `web-design-guidelines` ever disagree: **art direction defers to design-taste, correctness/accessibility defers to web-design-guidelines.** `visual-direction` sits underneath both — it's the vocabulary `design-taste` and `premium-3d-landing-page` reach for when a *visual/prompt* (not just layout/motion) decision needs to be made concrete.

Don't activate every skill on every task. Route by size:
- Simple task (copy tweak, one style fix) → 0–1 skill.
- Normal task (a component, a section) → `design-taste`, plus `web-design-guidelines` on final review.
- Motion-heavy task → add `scroll-motion-performance-accessibility`.
- Real 3D landing page → add `premium-3d-landing-page`.

Default flow for a serious design task: **read the brief → design read → look at the existing design system/tokens before inventing new ones → build → visual self-check (below) → critique → fix → accessibility/guidelines pass → ship.** Never treat the first draft as final.

## Visual self-check after UI changes

This environment ships a pre-installed Chromium browser wired up for Playwright
(`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, CLI available via `npx playwright`)
— no `playwright install` needed, and nothing to add to a package.json that
doesn't exist yet in this repo.

After making any change to a page or component, verify it visually before
reporting the task done:

1. Launch/refresh the app (see the `run` skill for how this project starts).
2. Open the changed page in the browser and take a screenshot.
3. Look at the screenshot: layout breakage, overlapping elements, unreadable
   contrast, missing responsive behavior, broken animations, console errors.
4. Fix anything wrong before handing the result back — don't assume code that
   compiles is code that looks right.
5. Show a before/after screenshot pair when reporting a real UI change.

Skip only when there is no way to render the page (pure backend/CLI change).

The standard to hold yourself to: not "I wrote the code" but "I implemented
it, ran it, looked at it, tested it, found the problems, fixed them, and
verified it again."

## Component/reference libraries — knowledge only, not installed

These are known reference sources for *when a concrete need shows up* — not
dependencies to add speculatively. Extract the pattern and adapt it to this
project's tokens; never paste a component in with its default demo look:

- **react-bits** (`DavidHDev/react-bits`) — creative motion components (text FX, backgrounds, cursor effects). Use at most one dominant effect per page.
- **Magic UI** (`magicuidesign/magicui`) — animated Tailwind/shadcn-compatible sections.
- **Motion Primitives** (`ibelick/motion-primitives`) — minimal, subtle motion (text morph/scramble, magnetic, tilt, blur). Prefer this over heavier effects for restrained motion.
- **Aceternity UI** (ui.aceternity.com) — scroll storytelling pieces (parallax hero, sticky scroll reveal, tracing beam).
- **21st.dev** (`21st-dev` org) — component discovery/marketplace; check for an existing solution before building one.
- **threeui** (`MengTo/threeui`) — Three.js/WebGL 3D UI patterns, for when a project actually needs 3D.
- **aicanvas** (`uiNerd16/aicanvas`) — animated React/Tailwind/Framer Motion/Three.js component reference.
- **screenshot-to-code** (`abi/screenshot-to-code`) — helper only when a concrete screenshot/section reference exists; split the reference into sections (header, hero, features, ...) and analyze each rather than regenerating the whole page at once. Never copy branding/logos/copy/proprietary assets — extract the system, not the pixels.
- **Figma/tokens tooling** (`figma/code-connect`, `figma/sds`, `tokens-studio/figma-plugin`, `style-dictionary/style-dictionary`) — only relevant if a Figma/design-token workflow is actually in play.

Before adding any of these as a real dependency: check it isn't archived/abandoned, confirm the license, and check what it drags in transitively.

## Cloning / recreating an existing site

If converting a working site, treat it as the source of truth. Reverse-engineer
its DOM/CSS/JS/scroll engine before touching anything, and don't rewrite its
motion/scroll engine or reorder sections "because it's better" — only change
what was actually asked for.

## Visual reference workflow

Given a URL/screenshot/video reference, don't code straight from it. First do
a forensic pass (layout, grid, spacing, type, hierarchy, motion, responsive
behavior), then state explicitly: what to keep, what to adapt, what not to
copy, how to make the result original rather than a clone.
