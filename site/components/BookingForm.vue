<script setup lang="ts">
const { locations } = useSiteContent()
const form = reactive({ location: locations[0], name: '', phone: '', message: '' })
const errors = reactive<Record<string, string>>({})
const sent = ref(false)

function validate(field: 'name' | 'phone') {
  if (field === 'name') errors.name = form.name.trim() ? '' : 'Please enter your name.'
  if (field === 'phone') errors.phone = /^[\d\s+()-]{7,}$/.test(form.phone) ? '' : 'Please enter a valid phone number.'
}

function submit() {
  validate('name'); validate('phone')
  if (errors.name || errors.phone) return
  // Wire to the practice's booking endpoint / CRM.
  sent.value = true
}
</script>

<template>
  <form class="bk" novalidate @submit.prevent="submit">
    <fieldset class="bk__loc">
      <legend class="eyebrow">Choose your location:</legend>
      <label v-for="loc in locations" :key="loc" class="bk__radio">
        <input v-model="form.location" type="radio" name="location" :value="loc" />
        <span>{{ loc }}</span>
      </label>
    </fieldset>

    <div class="bk__field">
      <label for="bk-name">Name</label>
      <input id="bk-name" v-model="form.name" type="text" autocomplete="name"
             :aria-invalid="!!errors.name" :aria-describedby="errors.name ? 'bk-name-err' : undefined"
             @blur="validate('name')" />
      <p v-if="errors.name" id="bk-name-err" class="bk__err">{{ errors.name }}</p>
    </div>

    <div class="bk__field">
      <label for="bk-phone">Phone number</label>
      <input id="bk-phone" v-model="form.phone" type="tel" autocomplete="tel"
             :aria-invalid="!!errors.phone" :aria-describedby="errors.phone ? 'bk-phone-err' : undefined"
             @blur="validate('phone')" />
      <p v-if="errors.phone" id="bk-phone-err" class="bk__err">{{ errors.phone }}</p>
    </div>

    <div class="bk__field">
      <label for="bk-msg">Message</label>
      <textarea id="bk-msg" v-model="form.message" rows="3"></textarea>
    </div>

    <button class="btn bk__submit" type="submit">Send</button>
    <p v-if="sent" class="bk__ok" role="status">Thank you — we’ll call you back shortly.</p>
  </form>
</template>

<style scoped>
.bk { display: grid; gap: 1.5rem; max-width: 32rem; }
.bk__loc { border: 0; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 1rem; }
.bk__loc legend { margin-bottom: .75rem; }
.bk__radio { display: inline-flex; align-items: center; gap: .5rem; font-size: .9375rem; cursor: pointer; }
.bk__field { display: grid; gap: .5rem; }
.bk__field label { font-size: .8125rem; font-weight: 600; color: var(--c-light-beige); }
input[type="text"], input[type="tel"], textarea {
  min-height: 3rem; padding: .75rem 1rem;
  background: transparent; border: 1px solid var(--c-dark-40); border-radius: 8px;
  transition: border-color var(--dur-fast) var(--ease-out);
}
textarea { min-height: 6rem; resize: vertical; }
input:hover, textarea:hover { border-color: var(--c-light-beige); }
input[aria-invalid="true"], textarea[aria-invalid="true"] { border-color: var(--c-error); }
.bk__err { font-size: .8125rem; color: var(--c-error); }
.bk__submit { justify-self: start; }
.bk__ok { font-size: .9375rem; color: var(--c-brand-gold); }
</style>
