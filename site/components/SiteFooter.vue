<script setup lang="ts">
const { locations } = useSiteContent()
const cols = [
  { title: 'Services', links: [
    { label: 'Esthetic Dentistry', to: '/esthetic-dentistry' },
    { label: 'Restorative Dentistry', to: '/restorative-dentistry' },
    { label: 'Preventive Care', to: '/preventive-care' },
    { label: 'Beyond the Smile', to: '/beyond-the-smile' }
  ]},
  { title: 'Practice', links: [
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' }
  ]}
]
const year = new Date().getFullYear()
</script>

<template>
  <footer class="ftr">
    <div class="shell ftr__grid">
      <div class="ftr__brand">
        <img src="/images/logo-big.svg" alt="Aventura Dental Arts" width="190" height="99" />
        <ul class="ftr__loc">
          <li v-for="loc in locations" :key="loc">
            <img src="/images/pin.svg" alt="" width="14" height="14" aria-hidden="true" />
            <span>{{ loc }}</span>
          </li>
        </ul>
      </div>

      <nav v-for="col in cols" :key="col.title" class="ftr__col" :aria-label="col.title">
        <h2 class="eyebrow">{{ col.title }}</h2>
        <ul>
          <li v-for="l in col.links" :key="l.to">
            <NuxtLink :to="l.to">{{ l.label }}</NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="shell ftr__base">
      <p>&copy; {{ year }} Aventura Dental Arts. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.ftr { border-top: 1px solid var(--c-dark-10); padding-block: var(--section-y) 2rem; }
.ftr__grid { display: grid; gap: 3rem; }
.ftr__brand img { width: clamp(9rem, 16vw, 11rem); margin-bottom: 1.5rem; }
.ftr__loc { list-style: none; margin: 0; padding: 0; display: grid; gap: .5rem; font-size: .9375rem; }
.ftr__loc li { display: flex; align-items: center; gap: .5rem; }
.ftr__col ul { list-style: none; margin: 1rem 0 0; padding: 0; display: grid; gap: .625rem; font-size: .9375rem; }
.ftr__col a { color: var(--c-light-beige); transition: color var(--dur-fast) var(--ease-out); }
@media (hover: hover) { .ftr__col a:hover { color: var(--c-brand-gold); } }
.ftr__base { padding-top: 3rem; margin-top: 3rem; border-top: 1px solid var(--c-dark-10); font-size: .8125rem; color: var(--c-dark-brown); }
@media (min-width: 1024px) {
  .ftr__grid { grid-template-columns: 2fr 1fr 1fr; gap: 4rem; }
}
</style>
