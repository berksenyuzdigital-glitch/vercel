<template>
  <section class="pre section" aria-labelledby="pre-title">
    <div class="shell pre__grid">
      <div>
        <p class="eyebrow reveal">Premium esthetic dentistry</p>
        <h2 id="pre-title" class="display pre__title reveal">
          Bringing Your Perfect <em>Smile</em> to Life
        </h2>
      </div>
      <div class="pre__form reveal">
        <h3 class="h2 pre__sub">Ready to Transform Your Smile?</h3>
        <p class="pre__lead">Book a call.</p>
        <BookingForm />
      </div>
    </div>
  </section>
</template>

<style scoped>
.pre { border-top: 1px solid var(--c-dark-10); }
.pre__grid { display: grid; gap: 3.5rem; }
.pre__title { margin-top: .75rem; }
.pre__sub { font-size: clamp(1.5rem, 3vw, 2.25rem); }
.pre__lead { margin-block: .5rem 2rem; color: var(--c-light-beige); }
@media (min-width: 1024px) {
  .pre__grid { grid-template-columns: 1fr 1fr; gap: 5rem; align-items: start; }
}
</style>
