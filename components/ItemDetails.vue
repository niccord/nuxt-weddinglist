<template>
  <div class="h-full flex flex-col mt-4">
    <h1>{{item.name}}</h1>
    <div class="flex-1 mt-4">
      <p class="leading-normal">{{item.info}}</p>
    </div>
    <p class="text-center mt-6">
      <input type="number" name="amount" id="amount" v-model="amount" :class="{ inError: invalidAmount }" class="shadow appearance-none border rounded py-2 px-3 leading-tight">
    </p>
    <hr>
    <div class="text-center">
      <button id="buyBtn" @click="buy" :disabled="disabled" class="text-center shadow bg-orange-darker hover:bg-green-dark text-white font-bold py-2 px-4 rounded">Donate</button>
    </div>
    <button @click="close" class="w-full mt-6 p-4 border-t text-md text-orange-darker hover:text-green-dark">
      CLOSE
    </button>
    <modal :name="donateName" @before-close="beforeCloseDonate" classes="bg-orange-lightest px-4 rounded-md resp-width" height="auto" width="100%" :scrollable="true">
      <donation :item="item" :amount="amount"></donation>
    </modal>
  </div>
</template>
<script>
import donation from './Donation.vue';

export default {
  components: {
    donation
  },
  props: ['item'],
  data() {
    return {
      amount: 0,
      disabled: false,
      donateName: `donate-${this.item.name}`,
      invalidAmount: false
    }
  },
  methods: {
    beforeCloseDonate() {
      this.disabled = false;
    },
    close() {
      this.$modal.hide(this.item.name);
    },
    buy() {
      const amnt = parseInt(this.amount);
      if (amnt && amnt > 0) {
        this.invalidAmount = false;
        this.disabled = true;
        this.$modal.show(this.donateName);
      } else {
        this.invalidAmount = true;
      }
    }
  }
}
</script>

<style>
@media (min-width: 768px) {
  .resp-width {
    left: auto !important;
    width: 600px !important;
    margin: auto;
  }

  .inError {
    border: 1px solid red;
  }
}
</style>