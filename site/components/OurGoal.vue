<template>
  <section class="goal section">
    <div class="shell goal__grid">
      <h2 class="h2 reveal">Our goal is <em>excellence</em>, in every detail.</h2>
      <div class="goal__body reveal">
        <p class="body-lg">
          With decades of combined experience and ongoing advanced education, our team
          delivers care rooted in knowledge, precision, and an unwavering dedication to
          excellence.
        </p>
        <dl class="goal__stats">
          <div class="goal__stat">
            <dt class="eyebrow">Years of practice</dt>
            <dd class="goal__num">20<span aria-hidden="true">+</span></dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.goal { border-top: 1px solid var(--c-dark-10); }
.goal__grid { display: grid; gap: 2.5rem; }
.goal__body { display: grid; gap: 2.5rem; }
.goal__stats { display: flex; gap: 3rem; margin: 0; }
.goal__stat { display: grid; gap: .5rem; }
.goal__num { margin: 0; font-family: var(--font-instrument); font-size: clamp(3.5rem, 8vw, 6rem); line-height: 1; color: var(--c-brand-gold); }
@media (min-width: 1024px) {
  .goal__grid { grid-template-columns: 1fr 1fr; gap: 5rem; align-items: start; }
}
</style>
