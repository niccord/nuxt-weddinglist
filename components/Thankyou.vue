<template>
  <div>
    <h1>Donation confirmed</h1>
    <p class="mt-4 text-center leading-normal">
      Thanks for your donations! <br>
      The newlyweds
    </p>
    <p v-if="isBank" class="mt-4">
      Here is the informations for the bank transfer: <br>
      IBAN: IT60 X054 2811 1010 0000 0123 456<br>
      Intestazione: No one
    </p>
  </div>
</template>
<script>
export default {
  props: ['isBank'],
  data() {
    return { isBankPayment: this.isBank === true }
  }
}
</script>
