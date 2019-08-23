<template>
  <div class="body-font text-orange-darker bg-orange-lightest" style="font-size: 1.25em">
    <!-- Magic starts here -->
    <div name="container" class="container m-0 p-0 w-screen h-screen">
      <div name="header" class="container text-center mb-8">
          <div name="title" class="title-font text-4xl m-4">
              <a href="/" class="no-underline text-orange-darker hover:text-green-dark">Home</a>
          </div>
          <div class="container justify-center flex">
              <a href="where" class="block text-orange-darker hover:text-green-dark no-underline hover:underline mr-4">
                  Where
              </a>
              <a href="about-us" class="block text-orange-darker hover:text-green-dark no-underline hover:underline mr-4">
                  About us
              </a>
              <a href="login" class="block text-orange-darker hover:text-green-dark no-underline hover:underline">
                  List
              </a>
          </div>
      </div>
      <div name="content" class="container w-full mx-auto my-4 flex justify-around flex-wrap">
        <grid-item v-for="itemObject in items" :key="itemObject.id" :item="itemObject" />
      </div>
    </div>
    <!-- ./End of Magic -->
  </div>
</template>
<script>
import gridItem from '../components/GridItem.vue'
import axios from '../plugins/axios'

export default {
  components: {
    gridItem
  },
  async asyncData () {
    const i = await axios.get('/api/items');
    return {
      items: i.data
    }
  },
  head () {
    return {
      bodyAttrs: {
          class: 'bg-orange-lightest'
      }
    }
  }
}
</script>
