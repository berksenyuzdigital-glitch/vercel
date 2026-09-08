<script setup lang="ts">
const { testimonials } = useSiteContent()
const i = ref(0)
const go = (n: number) => { i.value = (n + testimonials.length) % testimonials.length }
const current = computed(() => testimonials[i.value])
</script>

<template>
  <section class="tst section" aria-labelledby="tst-title">
    <div class="shell">
      <div class="tst__head">
        <h2 id="tst-title" class="eyebrow">Testimonials</h2>
        <p class="tst__count" aria-live="polite">
          {{ String(i + 1).padStart(2, '0') }} <span aria-hidden="true">/</span> {{ String(testimonials.length).padStart(2, '0') }}
        </p>
      </div>

      <blockquote class="tst__quote reveal">
        <p v-if="current.quote" class="tst__text">{{ current.quote }}</p>
        <p v-else class="tst__text tst__text--empty">
          <!-- Pull approved, attributed patient reviews in from the CMS. -->
          Patient review pending.
        </p>
        <footer class="tst__meta">
          <cite v-if="current.author" class="tst__author">{{ current.author }}</cite>
          <span class="eyebrow">{{ current.treatment }}</span>
        </footer>
      </blockquote>

      <div class="tst__ctl">
        <button class="tst__btn" aria-label="Previous testimonial" @click="go(i - 1)">
          <img src="/images/control-arrow.svg" alt="" width="16" height="16" style="transform: rotate(180deg)" />
        </button>
        <button class="tst__btn" aria-label="Next testimonial" @click="go(i + 1)">
          <img src="/images/control-arrow.svg" alt="" width="16" height="16" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tst { border-top: 1px solid var(--c-dark-10); }
.tst__head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
.tst__count { font-size: .8125rem; font-weight: 600; color: var(--c-dark-brown); }
.tst__quote { margin: 3rem 0 0; max-width: 40ch; }
.tst__text { font-family: var(--font-instrument); font-size: clamp(1.6rem, 4vw, 3rem); line-height: 1.15; text-wrap: pretty; }
.tst__text--empty { color: var(--c-dark-brown); }
.tst__meta { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; padding-top: 1.5rem; }
.tst__author { font-style: normal; font-weight: 600; font-size: .9375rem; }
.tst__ctl { display: flex; gap: 1rem; padding-top: 2.5rem; }
.tst__btn {
  display: grid; place-items: center; width: 3rem; height: 3rem;
  border: 1px solid var(--c-dark-40); border-radius: 999px; background: transparent; cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-out);
}
.tst__btn:active { transform: scale(0.97); }
@media (hover: hover) { .tst__btn:hover { border-color: var(--c-light-base); } }
</style>
