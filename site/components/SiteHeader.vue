<script setup lang="ts">
const open = ref(false)
const nav = [
  { label: 'Esthetic Dentistry', to: '/esthetic-dentistry' },
  { label: 'Restorative Dentistry', to: '/restorative-dentistry' },
  { label: 'Preventive Care', to: '/preventive-care' },
  { label: 'Beyond the Smile', to: '/beyond-the-smile' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' }
]
</script>

<template>
  <header class="hdr">
    <a class="skip" href="#main">Skip to content</a>
    <div class="hdr__bar shell">
      <NuxtLink to="/" class="hdr__logo" aria-label="Aventura Dental Arts — home">
        <img src="/images/logo-big.svg" alt="" width="190" height="99" />
      </NuxtLink>

      <nav class="hdr__nav" aria-label="Primary">
        <NuxtLink v-for="item in nav" :key="item.to" :to="item.to">{{ item.label }}</NuxtLink>
      </nav>

      <button
        class="hdr__toggle"
        :aria-expanded="open"
        aria-controls="mobile-nav"
        @click="open = !open"
      >
        {{ open ? 'Close' : 'Menu' }}
      </button>
    </div>

    <nav id="mobile-nav" class="hdr__mobile" :hidden="!open" aria-label="Mobile">
      <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" @click="open = false">
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.hdr {
  position: fixed; inset: 0 0 auto 0; z-index: 100;
  /* Opaque enough that large display type doesn't ghost through while scrolling */
  background: color-mix(in oklab, var(--c-brand-navy) 96%, transparent);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--c-dark-10);
}
.skip {
  position: absolute; left: -9999px;
  padding: .75rem 1rem; background: var(--c-light-base); color: var(--c-brand-navy);
}
.skip:focus { left: 1rem; top: .5rem; z-index: 1; }

.hdr__bar { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; min-height: 4.5rem; }
/* Constrain by height so the 190x99 mark always fits the bar */
.hdr__logo { display: flex; align-items: center; }
.hdr__logo img { width: auto; height: clamp(1.75rem, 3.2vw, 2.5rem); }

.hdr__nav { display: none; gap: 1.75rem; font-size: .8125rem; font-weight: 500; }
.hdr__nav a { position: relative; padding-block: .25rem; color: var(--c-light-beige); transition: color var(--dur-fast) var(--ease-out); }
@media (hover: hover) { .hdr__nav a:hover { color: var(--c-light-base); } }
.hdr__nav a.router-link-active { color: var(--c-brand-gold); }

.hdr__toggle {
  min-height: 2.75rem; padding: 0 1rem; border: 1px solid var(--c-dark-40);
  border-radius: 999px; background: transparent; font-size: .8125rem; font-weight: 600; cursor: pointer;
}

.hdr__mobile {
  display: grid; gap: .25rem;
  padding: 1rem var(--gutter) 1.5rem;
  background: var(--c-brand-navy);
  border-top: 1px solid var(--c-dark-10);
}
.hdr__mobile a { padding: .75rem 0; font-size: 1.125rem; border-bottom: 1px solid var(--c-dark-10); }

@media (min-width: 1024px) {
  .hdr__nav { display: flex; }
  .hdr__toggle, .hdr__mobile { display: none; }
}
</style>
