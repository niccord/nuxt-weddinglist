<template>
    <div class="paymentModal">
      <div v-if="payed">
        <thank-you :isBank="isBank"></thank-you>
        <button @click="close" class="w-full mt-6 p-4 border-t text-md text-orange-darker hover:text-green-dark">
          CLOSE
        </button>
      </div>
      <div v-else>
          <div class="mt-4">
            <p class="text-center">You want to donate <span class="text-3xl">{{styledAmount}} €</span> for {{item.name}}</p>
          </div>
          <div class="text-center">
            <p class="mt-4">
              <label for="checkConfirm">
                You can receive a PDF to print and give to the couple. Are you interested?
              </label><br>
              <input type="checkbox" name="checkConfirm" id="checkConfirm" v-model="pdfSend">
            </p>
            <p class="mt-4">
              <label for="email">
                Insert your email<br><small> (a reminder will be sent to you for the bank transfer)</small>
              </label><br>
              <input type="email" name="email" id="email" v-model="userEmail" placeholder="Your email" class="shadow appearance-none border rounded py-2 px-3 leading-tight mt-4">
            </p>
          </div>
          <div class="text-center">
            <p class="mt-4">
              <label for="message">
                If you'd like, insert your message for the newlyweds (don't forget to sign it with your names)
              </label>
              <textarea name="message" id="message" cols="30" rows="5" v-model="userMessage" placeholder="Your messagge" class="shadow appearance-none border rounded py-2 px-3 leading-tight mt-4">
              </textarea>
            </p>
            <p class="mt-4">
              <label for="sign">
                Your sign *
              </label><br>
              <input
                type="text"
                name="sign"
                id="sign"
                v-model="userSign"
                placeholder="Your sign"
                class="shadow appearance-none border rounded py-2 px-3 leading-tight mt-4"
                @keyup="formError ? clearErrorState() : null"
                :class="{ errorInput: formError }">
              <small v-if="formError" :class="{ errorStyle: formError }"><br>Insert the sign!</small>
            </p>
          </div>
          <p class="mt-8 text-center">
            <vue-stripe-checkout
              ref="checkoutRef"
              :email="userEmail"
              image="/logo.png"
              name="Wedding donation"
              description="Newlyweds names"
              currency="EUR"
              :amount="amount * 100"
              :allow-remember-me="true"
              @done="done"
            ></vue-stripe-checkout>
            <button id="btnStripe" @click="stripeCheckout" class="text-center shadow bg-orange-darker hover:bg-green-dark text-white font-bold py-2 px-4 rounded">
              Donate with credit card
            </button>
          </p>
          <p class="my-4 text-center"> - or - </p>
          <div>
          </div>
          <div class="text-center">
            <button @click="bankCheckout" class="text-center shadow bg-orange-darker hover:bg-green-dark text-white font-bold py-2 px-4 rounded">
              Donate with bank transfer
            </button>
            
          </div>
          <div>
            
          </div>
          <button @click="close" class="w-full mt-6 p-4 border-t text-md text-orange-darker hover:text-green-dark">
            CLOSE
          </button>
      </div>
    </div>
</template>
<script>
import axios from '../plugins/axios';
import thankYou from './Thankyou.vue';

export default {
  props: ['item', 'amount'],
  components: {
    thankYou
  },
  data() {
    return {
      donateName: `donate-${this.item.name}`,
      styledAmount: parseFloat(this.amount).toFixed(2),
      userEmail: '',
      userMessage: '',
      userSign: '',
      payed: false,
      pdfSend: true,
      isBank: false,
      formError: false,
    }
  },
  methods: {
    checkForm() {
      this.formError = this.userSign.trim().length < 3;
      return !this.formError;
    },
    clearErrorState() {
      this.formError = this.userSign.trim().length < 3;
    },
    close() {
      this.$modal.hide(this.donateName);
    },
    bankCheckout() {
      if (this.checkForm() && confirm(`Are you sure you want to donate ${this.styledAmount} € `)) {
        this.isBank = true;
        return this.saveOrder({ email: this.userEmail });
      }
    },
    saveOrder (token) {
      console.log('Payload');
      console.log(token);
      const donation = Object.assign({}, token);
      donation.item_id = this.item.id;
      donation.name = this.item.name;
      donation.amount = this.amount;
      donation.userMessage = this.userMessage;
      donation.userSign = this.userSign;
      donation.pdfSend = this.pdfSend;
      axios.post(
        '/api/saveDonation',
        { params: { donation, tokenId: token.id, isBank: this.isBank } },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          console.log('Ahoy!');
          this.payed = true;
        })
        .catch(err => {
          if (!this.isBank) {
            alert(`A payment error occurred. The credit has not been deducted.`);
          }
          console.log(err);
        });
    },
    async stripeCheckout () {
      if (this.checkForm()) {
        // token - is the token object
        // args - is an object containing the billing and shipping address if enabled
        const { token, args } = await this.$refs.checkoutRef.open();
      }
    },
    done ({token, args}) {
      // token - is the token object
      // args - is an object containing the billing and shipping address if enabled
      // do stuff...
      this.isBank = false;
      this.saveOrder(token);
    },
  }
}
</script>
<style>
.errorInput {
  border: 1px solid red;
}
.errorStyle {
  color: red;
}
</style>
