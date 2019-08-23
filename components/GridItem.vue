<template>
    <div class="shadow-lg rounded-lg w-full md:w-1/4 flex flex-col my-4" @click="showDetails">
        <h2 class="m-4">{{item.name}}</h2>
        <img v-bind:src="item.photo_url" class="w-full">
        <p class="flex-1 m-4 leading-normal">{{item.info}}</p>
        <p class="text-center mt-4">
        <input type="button" value="Contribuisci" class="text-center shadow bg-orange-darker hover:bg-green-dark text-white font-bold py-2 px-4 rounded m-4">
        </p>
        <modal :name="item.name" @before-close="beforeClose" classes="bg-orange-lightest px-4 rounded-md resp-width" height="auto" width="100%" :scrollable="true">
          <item-details :item="item"></item-details>
        </modal>
    </div>
</template>
<script>

import itemDetails from './ItemDetails.vue' 

export default {
  components: {
    itemDetails
  },
  data(){
    return {
      modalOnScreen: false
    }
  },
  props: ['item'],
  methods: {
    showDetails() {
      if (!this.modalOnScreen) {
        this.$modal.show(this.item.name);
        this.modalOnScreen = true;
      }
    },
    beforeClose() {
      setTimeout(() => this.modalOnScreen = false, 0);
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
}
</style>