<script setup lang="ts">
const { experts } = useSiteContent()
</script>

<template>
  <section class="exp section" aria-labelledby="exp-title">
    <div class="shell">
      <h2 id="exp-title" class="h2 reveal">Team of Experts</h2>
      <ul class="exp__grid">
        <li v-for="p in experts" :key="p.name" class="exp__card reveal">
          <img class="exp__img" :src="p.image" :alt="`${p.name}, ${p.role}`" loading="lazy" width="600" height="750" />
          <h3 class="exp__name">{{ p.name }}</h3>
          <p class="eyebrow">{{ p.role }}</p>
          <p v-if="p.bio" class="exp__bio">{{ p.bio }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.exp { border-top: 1px solid var(--c-dark-10); }
.exp__grid { list-style: none; margin: 3rem 0 0; padding: 0; display: grid; gap: 2.5rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.exp__card { display: grid; gap: .5rem; }
.exp__img { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 12px; margin-bottom: .75rem; }
.exp__name { font-family: var(--font-instrument); font-weight: 400; font-size: 1.5rem; }
.exp__bio { font-size: .9375rem; color: var(--c-light-beige); max-width: 34ch; }
</style>
