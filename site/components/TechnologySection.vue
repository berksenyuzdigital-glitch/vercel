<script setup lang="ts">
const { technology } = useSiteContent()
const i = ref(0)
const go = (n: number) => { i.value = (n + technology.length) % technology.length }
</script>

<template>
  <section class="tech section" aria-labelledby="tech-title">
    <div class="shell">
      <p class="eyebrow reveal">Technology-Driven</p>
      <h2 id="tech-title" class="h2 tech__title reveal">Dentistry for Exceptional Results</h2>

      <div class="tech__stage">
        <div class="tech__viewport">
          <figure v-for="(t, n) in technology" :key="t.title" class="tech__slide" :class="{ 'is-active': n === i }" :aria-hidden="n !== i">
            <img :src="t.image" :alt="t.title" loading="lazy" width="900" height="600" />
            <figcaption class="tech__cap">
              <h3 class="tech__name">{{ t.title }}</h3>
              <NuxtLink :to="t.to" class="btn" :tabindex="n === i ? 0 : -1">Learn more</NuxtLink>
            </figcaption>
          </figure>
        </div>

        <div class="tech__ctl">
          <button class="tech__btn" aria-label="Previous" @click="go(i - 1)">
            <img src="/images/control-arrow.svg" alt="" width="16" height="16" style="transform: rotate(180deg)" />
          </button>
          <p class="tech__count" aria-live="polite">
            {{ String(i + 1).padStart(2, '0') }} <span aria-hidden="true">/</span> {{ String(technology.length).padStart(2, '0') }}
          </p>
          <button class="tech__btn" aria-label="Next" @click="go(i + 1)">
            <img src="/images/control-arrow.svg" alt="" width="16" height="16" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tech { border-top: 1px solid var(--c-dark-10); }
.tech__title { margin-block: .5rem 3rem; max-width: 18ch; }
.tech__viewport { position: relative; }
.tech__slide { margin: 0; opacity: 0; visibility: hidden; transition: opacity 500ms var(--ease-out); }
.tech__slide:not(:first-child) { position: absolute; inset: 0; }
.tech__slide.is-active { opacity: 1; visibility: visible; }
.tech__slide img { width: 100%; aspect-ratio: 3 / 2; object-fit: cover; border-radius: 12px; }
.tech__cap { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; padding-top: 1.5rem; }
.tech__name { font-family: var(--font-instrument); font-weight: 400; font-size: clamp(1.35rem, 2.6vw, 2rem); }
.tech__ctl { display: flex; align-items: center; gap: 1.25rem; padding-top: 2rem; }
.tech__btn {
  display: grid; place-items: center; width: 3rem; height: 3rem;
  border: 1px solid var(--c-dark-40); border-radius: 999px; background: transparent; cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.tech__btn:active { transform: scale(0.97); }
@media (hover: hover) { .tech__btn:hover { border-color: var(--c-light-base); } }
.tech__count { font-size: .8125rem; font-weight: 600; color: var(--c-dark-brown); }
</style>
