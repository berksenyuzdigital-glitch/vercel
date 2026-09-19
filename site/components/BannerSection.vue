<script setup lang="ts">
const words = ['Faster', 'Smarter', 'Pain-Free']
const active = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => { active.value = (active.value + 1) % words.length }, 2200)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section class="banner section" aria-labelledby="banner-title">
    <div class="shell">
      <h2 id="banner-title" class="display banner__title reveal">
        Modern Dentistry:
        <span class="banner__rotator">
          <span class="sr-only">{{ words.join(', ') }}</span>
          <span
            v-for="(w, i) in words"
            :key="w"
            class="banner__word"
            :class="{ 'is-active': i === active }"
            aria-hidden="true"
          >{{ w }}</span>
        </span>
      </h2>
    </div>
  </section>
</template>

<style scoped>
.banner { border-top: 1px solid var(--c-dark-10); text-align: center; }
.banner__rotator { position: relative; display: inline-grid; }
.banner__word {
  grid-area: 1 / 1; color: var(--c-brand-gold); font-style: italic;
  opacity: 0; transform: translateY(12px);
  transition: opacity 420ms var(--ease-out), transform 420ms var(--ease-out);
}
.banner__word.is-active { opacity: 1; transform: none; }
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
@media (prefers-reduced-motion: reduce) {
  .banner__word { position: static; opacity: 1; transform: none; }
  .banner__word:not(:last-child)::after { content: ', '; }
}
</style>
