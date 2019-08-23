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
      <div name="content" class="container max-w-md mx-auto my-4">
        <p class="leading-normal">
          Thanks for be here and if you want to contribute to our wedding and our life together.
        </p>
        <form class="mt-12 text-center">
            <input type="password" id="password" v-model="pass" @keydown="submitIfEnter" placeholder="******************" class="shadow appearance-none border border-orange-darker rounded py-2 px-3 text-orange-darker mb-3 leading-tight focus:border-green-dark">
            <input type="submit" value="Entra!" @click.prevent="checkPassword" class="shadow bg-orange-darker hover:bg-green-dark text-white font-bold py-2 px-4 rounded"><br /><br />
            <p class="leading-normal">Insert here the password<br />you have found on the invitation</p>
            <p for="pass" v-if="passError" class="text-red">Wrong password</p>
        </form>
      </div>
    </div>
    <!-- ./End of Magic -->
  </div>
</template>

<script>
import axios from '../plugins/axios';

export default {
  data () {
    return {
      pass: '',
      passError: false
    }
  },
  mounted() {
    const getAuthCookie = document.cookie.split(';').find(c => c.split('=')[0] === 'weddingcookie');
    console.log('getAuthCookie', getAuthCookie)
    if (getAuthCookie === 'weddingcookie=ThisIsTheWeddingCookie') {
      this.$router.push('/items');
    }
  },
  methods: {
    checkPassword () {
      this.passError = false;
      axios.post(
        '/api/checkpassword',
        { params: { pass: this.pass } },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((res) => {
          document.cookie = 'weddingcookie=ThisIsTheWeddingCookie'
          this.$router.push('/items');
        })
        .catch(() => {
          this.passError = true;
        });
    },
    submitIfEnter (e) {
      if (e.keyCode === 13) { // if enter pressed
        this.checkPassword();
      }
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