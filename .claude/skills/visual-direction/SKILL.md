---
name: visual-direction
description: Technical visual/camera/rendering direction for any image, video, or 3D-scene prompt, and for designing 3D hero scenes, product visualization, architectural visualization, technical illustration (exploded/cutaway/X-ray), or scroll-driven camera choreography. Use whenever generating or specifying an image-generation prompt, a video-generation prompt, a 3D render, a website hero visual, a product shot, an architectural render, or a technical diagram — or when a visual brief only has vague adjectives ("premium", "cinematic", "modern", "high quality", "3D") and needs to become a technically specific spec. Pairs with design-taste (art direction) and premium-3d-landing-page (page-level 3D structure).
---

# Visual Direction — Camera, Rendering & Technical Visualization

Vague adjectives are not a spec. "Premium cinematic 3D" tells a renderer nothing decidable. Every visual decision of consequence gets described through the actual disciplines that produce it: camera, lens, projection, composition, depth, lighting, material, color, rendering style, motion, and how it lands in the website layout.

## The default thinking chain

For any hero image, 3D scene, product render, architectural visual, technical diagram, or motion choreography, work through this before writing the prompt or building the scene:

```
WHAT ARE WE SHOWING?
↓ WHY ARE WE SHOWING IT?
↓ FROM WHICH ANGLE?
↓ WITH WHICH LENS?
↓ WITH WHICH PROJECTION?
↓ HOW IS IT COMPOSED?
↓ HOW IS DEPTH CREATED?
↓ HOW IS IT LIT?
↓ WHAT MATERIAL RESPONSE IS REQUIRED?
↓ HOW DOES IT FIT THE WEBSITE?
↓ HOW DOES IT MOVE?
↓ HOW DOES IT WORK ON MOBILE?
↓ WHAT MUST NOT APPEAR?
```

Never pick camera angle, lens, or projection at random — each is a decision that affects perceived scale, brand character, and how much negative space is left for website copy.

## The visual prompt formula

For any prompt that matters, build it in this order (skip a step only when it's genuinely not applicable):

```
SUBJECT → PURPOSE → WEBSITE SECTION / USE CASE
→ CAMERA ANGLE → PROJECTION → LENS / FOCAL LENGTH
→ CAMERA DISTANCE → CAMERA HEIGHT
→ COMPOSITION → SUBJECT PLACEMENT → NEGATIVE SPACE
→ FOREGROUND / MIDGROUND / BACKGROUND
→ MATERIAL → LIGHTING → COLOR DIRECTION → RENDER STYLE
→ DEPTH OF FIELD → MOTION → BACKGROUND
→ ASPECT RATIO → RESPONSIVE CROP CONSIDERATIONS
→ NEGATIVE CONSTRAINTS
```

"Cinematic camera" is not a spec. At minimum, always pair **camera angle + focal length + camera distance + depth of field**.

## Reference files (load when going deep on that area)

| File | Covers |
|---|---|
| `reference/camera-lens-projection.md` | Camera angles/viewpoints, shot scale, perspective/projection systems, focal length + optics vocabulary, camera movement (including scroll-driven) |
| `reference/composition-and-web.md` | Composition principles, website hero composition, product-visualization decision order, the camera↔website-copy relationship questions |
| `reference/technical-visualization.md` | Exploded views, cutaway/section, transparent/X-ray, technical illustration, architectural visualization, diagram/information visualization |
| `reference/render-material-light-color.md` | 3D rendering styles, PBR material/surface terminology, lighting setups, color/tonal grading, cinematic image language, editorial/graphic-design layout vocabulary |
| `reference/anti-generic-and-examples.md` | The anti-generic-cliché ban list, the originality rule, the technical-accuracy rule, four fully worked example prompts, and the final pre-ship checklist |

## Rules that always apply

- **Projection follows purpose**: technical explanation → orthographic/isometric/axonometric; premium product hero → perspective/three-quarter; architecture diagram → axonometric/section perspective; immersive cinematic scene → perspective camera.
- **Camera movement needs a narrative reason.** A dolly, orbit, or reveal exists to support a state change (scroll progress, feature reveal, spatial transition) — never movement for its own sake.
- **Material descriptions are physical, not generic.** Not "metal" — "brushed anodized aluminum, medium-low roughness, subtle anisotropic highlights, fine machining texture."
- **Every hero visual is designed with the website layout, not just as a standalone image**: where the headline sits, where the CTA sits, whether the subject's gaze/motion points toward the copy, whether the crop survives mobile.
- **Don't stack cinematic effects for their own sake.** `film grain + bloom + flare + chromatic aberration + heavy vignette` all at once does not read as "more cinematic" — it reads as noise.
- **Don't hallucinate technical detail.** Unknown mechanical/architectural/electronic specifics get marked conceptual/illustrative/schematic rather than invented as if real.
- **Given a reference image, never copy it.** Analyze its camera logic, lens logic, composition, lighting, material treatment, depth, color, and crop — then rebuild that system as something original to this brand.

Before shipping any visual or prompt that matters, run the checklist in `reference/anti-generic-and-examples.md`.
