<script setup lang="ts">
const locations = ['Aventura', 'Bay Harbor', 'Coral Gables']
</script>

<template>
  <section class="hero">
    <div class="hero__media">
      <video
        class="hero__video"
        poster="/images/hero-poster.png"
        autoplay
        muted
        loop
        playsinline
        aria-hidden="true"
      >
        <source src="/media/Final_ADA_f13c7df4ea.webm" type="video/webm" />
      </video>
      <div class="hero__scrim" aria-hidden="true"></div>
    </div>

    <div class="hero__inner shell">
      <aside class="hero__aside">
        <p class="eyebrow">Based in:</p>
        <ul class="hero__locations">
          <li v-for="loc in locations" :key="loc">{{ loc }}</li>
        </ul>
      </aside>

      <div class="hero__copy">
        <p class="eyebrow hero__eyebrow">Premium Esthetic Dentistry</p>
        <h1 class="display display--xl hero__title">
          Your smile, <em>effortlessly</em> enhanced
        </h1>
        <p class="hero__kicker">
          We combine advanced science with an artist’s touch.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: flex-end;
  padding-block: 7rem 3rem;
  overflow: hidden;
}

.hero__media { position: absolute; inset: 0; z-index: 0; }
.hero__video { width: 100%; height: 100%; object-fit: cover; }
.hero__scrim {
  position: absolute; inset: 0;
  background: linear-gradient(
    to top,
    color-mix(in oklab, var(--c-brand-navy) 92%, transparent) 0%,
    color-mix(in oklab, var(--c-brand-navy) 45%, transparent) 45%,
    color-mix(in oklab, var(--c-brand-navy) 20%, transparent) 100%
  );
}

.hero__inner {
  position: relative; z-index: 1;
  display: grid; gap: 2.5rem;
  width: 100%;
}

.hero__aside { display: grid; gap: .5rem; align-content: start; }
.hero__locations { list-style: none; padding: 0; display: grid; gap: .125rem; font-weight: 600; font-size: .9375rem; }

.hero__eyebrow { color: var(--c-light-beige); }
.hero__title { margin-block: .75rem 1.25rem; }
.hero__kicker {
  font-weight: 600; font-size: .9375rem; line-height: 1.4;
  max-width: 22ch; color: var(--c-light-beige);
}

@media (min-width: 1024px) {
  .hero { padding-block: 8rem 3.5rem; }
  .hero__inner {
    grid-template-columns: 16rem 1fr;
    align-items: end;
    gap: 4rem;
  }
  .hero__copy { display: grid; justify-items: start; }
  /* Keep the display line off the right edge so the kicker keeps its own column */
  .hero__title { max-width: 15ch; }
  .hero__kicker { justify-self: end; text-align: right; margin-top: .5rem; }
}
</style>
