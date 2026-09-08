# Anti-Generic Rules, Originality, and Worked Examples

## Anti-generic visual bans

Don't reach for these by default — use only if the brief genuinely calls for it:

`purple neon`, `blue neon`, `random cyberpunk`, `floating particles everywhere`, `heavy bloom`, `fake lens flare`, `unnecessary glass`, `gold + beige luxury cliché`, `random smoke/fog`, `meaningless holograms`, `generic gradient background`, `fake HUD`, `floating UI cards around every product`, `unnecessary depth of field`, `extreme fisheye`, `impossible materials`, `unmotivated camera tilt`.

## Originality rule

Given a reference image: **do not copy it.** Analyze its camera logic, lens logic, composition, lighting, material treatment, depth, color, and crop — then rebuild that system as something original and brand-specific. Never reproduce branding, logos, copyrighted assets, or copy verbatim.

## Technical accuracy rule

Don't invent mechanical components, architectural structure, internal electronics, dimensions, materials, assembly sequence, or engineering labels that weren't actually supplied. Mark anything not grounded in real data as conceptual/illustrative/schematic.

---

## Worked example — premium product hero

Weak: *"Create a premium cinematic 3D product image."* Don't write prompts like this. Instead:

```
Create a premium product hero render for a desktop website hero.

Camera: three-quarter low-angle view, 50mm full-frame equivalent lens,
moderate camera distance, subtle perspective compression.

Composition: asymmetrical composition, product positioned on the right
third, clean negative space on the left for a two-line headline and CTA,
foreground edge providing subtle depth without blocking the product.

Materials: physically based materials, accurate roughness and
micro-surface detail, controlled specular highlights.

Lighting: large diffused key light from upper left, subtle fill,
controlled rim highlight separating the silhouette from the background,
soft contact shadow, global illumination.

Render: photoreal path-traced CGI, high dynamic range, natural highlight
roll-off, no excessive bloom.

Depth: moderately shallow depth of field, entire hero feature readable.

Background: minimal dark-neutral studio environment, slight tonal
gradient produced by real lighting rather than graphic gradient overlays.

Aspect ratio: 16:9 desktop hero, composition must remain crop-safe for
4:5 tablet and 9:16 mobile.

Negative constraints: no AI-purple glow, no unnecessary floating
particles, no random lens flare, no text embedded in the image, no fake
logo, no excessive depth blur, no surreal object deformation.
```

## Worked example — exploded product view

```
Create a technical exploded axonometric visualization of the product.

Projection: clean axonometric projection with minimal perspective
distortion.

Assembly: components separated along their true assembly axes, maintain
correct relative positioning, consistent spacing between layers, no
random floating pieces.

Hierarchy: main housing, structural frame, electronics, functional
modules, fasteners, outer shell.

Visual treatment: semi-transparent ghosted external shell, opaque
internal functional components, clean technical labeling zones, no
decorative clutter.

Lighting: neutral studio lighting, high readability, soft ambient
occlusion between components.

Render: high-end industrial design visualization, PBR materials,
precise edges, technical yet premium.

Background: neutral off-white. Aspect ratio: 16:9.

No labels should be hallucinated unless actual component names are
supplied.
```

## Worked example — architectural axonometric

```
Create an exploded architectural axonometric diagram.

Projection: parallel axonometric projection.

Layers: site base, structural grid, floor plates, circulation, program
zones, facade system, roof system.

Composition: vertical exploded stack, consistent separation distances,
aligned architectural axes, clear hierarchy.

Visual direction: minimal editorial architectural diagram, limited
material palette, clean shadow separation, no photoreal clutter.

Information: circulation and program should remain visually distinct,
but do not invent labels or functions not supplied.

Background: neutral architectural presentation background.
```

## Worked example — scroll-driven 3D hero choreography

Write scroll choreography technically — each scroll segment maps to a real state change, never movement for its own sake:

```
STATE 01 — Eye-level three-quarter camera. Product static. Wide
composition. Headline readable.

SCROLL 0–30% — Slow camera dolly-in. Minimal object rotation. Foreground
depth increases.

STATE 02 — Camera reaches medium product distance. Primary feature
aligns toward viewer. Copy transitions to feature explanation.

SCROLL 30–65% — Camera performs a controlled 25-degree orbit. Outer
shell becomes ghosted. Internal component revealed.

STATE 03 — Exploded assembly begins. Components separate along real
assembly axes.

SCROLL 65–100% — Camera stabilizes. Exploded view fully readable. CTA
appears. No additional camera movement after the CTA.
```

Cross-check this choreography against `scroll-motion-performance-accessibility` for input-safety and frame-budget QA once it's implemented.

## Final visual direction checklist

Run before shipping any visual or prompt that matters:

- [ ] Purpose clear
- [ ] Camera angle intentional
- [ ] Lens intentional
- [ ] Projection appropriate
- [ ] Composition intentional, clear focal point
- [ ] Negative space planned for web copy
- [ ] Foreground/midground/background considered
- [ ] Material physically coherent
- [ ] Lighting motivated
- [ ] Color linked to brand
- [ ] Render style chosen intentionally
- [ ] Depth of field justified
- [ ] Responsive crop considered
- [ ] Motion has a reason
- [ ] No generic AI visual clichés
- [ ] Technical information not hallucinated
- [ ] Result works inside the website, not only as a standalone image
