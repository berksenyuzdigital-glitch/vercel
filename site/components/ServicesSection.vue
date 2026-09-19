<script setup lang="ts">
const { services } = useSiteContent()
</script>

<template>
  <section class="svc section" aria-labelledby="svc-title">
    <div class="shell">
      <h2 id="svc-title" class="eyebrow svc__eyebrow reveal">Our Solutions:</h2>
      <ul class="svc__list">
        <li v-for="(s, i) in services" :key="s.title" class="svc__item reveal">
          <NuxtLink :to="s.to" class="svc__link">
            <span class="svc__idx" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="svc__title">{{ s.title }}</span>
            <img class="svc__arrow" src="/images/arrow.svg" alt="" width="20" height="20" />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.svc { border-top: 1px solid var(--c-dark-10); }
.svc__eyebrow { margin-bottom: 2.5rem; }
.svc__list { list-style: none; margin: 0; padding: 0; }
.svc__item { border-top: 1px solid var(--c-dark-10); }
.svc__item:last-child { border-bottom: 1px solid var(--c-dark-10); }
.svc__link {
  display: grid; grid-template-columns: 3rem 1fr auto; align-items: center; gap: 1rem;
  padding-block: clamp(1.1rem, 2.4vw, 1.9rem);
  transition: color var(--dur-base) var(--ease-out), padding-inline var(--dur-base) var(--ease-out);
}
.svc__idx { font-size: .75rem; font-weight: 600; color: var(--c-dark-brown); }
.svc__title { font-family: var(--font-instrument); font-size: clamp(1.5rem, 3.6vw, 2.75rem); line-height: 1.1; }
.svc__arrow { opacity: 0; transform: translateX(-8px); transition: opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out); }
@media (hover: hover) {
  .svc__link:hover { color: var(--c-brand-gold); padding-inline: .75rem; }
  .svc__link:hover .svc__arrow { opacity: 1; transform: none; }
}
.svc__link:focus-visible .svc__arrow { opacity: 1; transform: none; }
</style>
