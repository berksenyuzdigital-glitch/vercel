# Rendering, Material, Lighting & Color

## 3D rendering styles

State the render style explicitly — not every project should default to photoreal:

`Photorealistic`, `Realistic`, `Hyperreal`, `PBR (Physically Based Rendering)`, `Ray-Traced`, `Path-Traced`, `Raster Render`, `Clay Render`, `White Model Render`, `Matcap Render`, `Wireframe Render`, `Toon / Cel-Shaded`, `NPR (Non-Photorealistic Rendering)`, `Stylized Render`, `Studio/Cinematic/Editorial CGI`, `Concept Render`, `Technical Render`.

Choose the style to match the brand — a technical/utility brand may want a Clay or Concept render; a luxury brand may want full path-traced photoreal.

## Material / surface terminology (PBR)

`Base Color / Albedo`, `Roughness`, `Metallic`, `Normal Map`, `Bump Map`, `Height Map`, `Displacement Map`, `Ambient Occlusion`, `Specular`, `Transmission`, `Refraction`, `IOR (Index of Refraction)`, `Subsurface Scattering (SSS)`, `Clearcoat`, `Anisotropy`, `Emissive`, `Opacity / Alpha`, `Micro-Surface Detail`, `Procedural Material`, `UV Mapping`, `Texture Mapping`.

Never describe a material as just "metal", "glass", "wood". Describe it at the level of: *"brushed anodized aluminum, medium-low roughness, subtle anisotropic highlights, fine machining texture."*

## Lighting

`Key/Fill/Rim/Backlight`, `Side/Top/Bottom Light`, `Practical Light`, `Motivated Lighting`, `Three-Point Lighting`, `Softbox/Studio Lighting`, `High-Key/Low-Key Lighting`, `Hard/Soft/Diffused Light`, `Directional/Area/Point/Spot Light`, `Environment Light`, `HDRI Lighting`, `Global Illumination`, `Bounce Light`, `Volumetric Lighting`, `God Rays`, `Contact Shadows`, `Ambient Shadows`, `Rim Highlight`, `Light Wrap`.

Rule: light exists to reveal the subject's material — never add neon color randomly; every light choice should be motivated by the scene's logic (a window, a screen, a studio softbox), not decoration.

## Color / tonal direction

`Color Palette/Harmony`, `Monochromatic`, `Analogous`, `Complementary`, `Split Complementary`, `Triadic`, `Temperature Contrast`, `Warm/Cool Balance`, `Saturation`, `Chroma`, `Luminance`, `Value`, `Tonal Range`, `Dynamic Range`, `Highlight Roll-Off`, `Black Point`, `White Point`, `Color Grading`, `Filmic/Cinematic Grade`, `Contrast Curve`, `Lift`, `Gamma`, `Gain`.

Color grade must connect to the site's actual brand palette — never generated independently of the design system's tokens.

## Cinematic image language

`Cinematic Composition/Lighting`, `Film Still`, `Anamorphic Look`, `Film Grain`, `Halation`, `Bloom`, `Chromatic Aberration`, `Lens Flare`, `Vignette`, `Motion Blur`, `Shutter Angle`, `Exposure`, `Aperture`, `ISO`, `White Balance`, `Dynamic Range`.

Don't stack every cinematic effect into one prompt — `film grain + bloom + flare + chromatic aberration + heavy vignette` reads as noise, not "more cinematic." Pick the one or two effects that actually serve the scene's mood.
