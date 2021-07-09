<template>
  <v-dialog v-model="showTerms" persistent max-width="600">
    <template #activator="{ on, attrs }">
      <v-btn
        style="font-weight: bold"
        color="white"
        class="text-body-1"
        plain
        v-bind="attrs"
        v-on="on"
      >
        Terms of Use
      </v-btn>
    </template>
    <v-card>
      <v-card-title><h2>Terms of Use</h2></v-card-title>
      <v-card-text>
        <p class="text-body-1">
          By using the SKOPE application, you assume any risk associated with
          its use. You are solely responsible for any damage or loss you may
          incur resulting from your reliance on or use of information provided
          by SKOPE.
        </p>

        <h2>Citation</h2>
        <p class="text-body-1">
          Use of data, graphics, or other information provided by SKOPE should
          be accompanied by a citation to the application and of the original
          data source (provided by SKOPE in the dataset metadata) and of the
          SKOPE web application.
        </p>

        <h2>Example reference</h2>
        <p class="text-body-1">(SKOPE 2021)</p>

        <h2>Example Citation</h2>
        <blockquote class="blockquote">
          SKOPE 2021 SKOPE: Synthesizing Knowledge of Past Environments.
          https://app.openskope.org/. Accessed 1 July 2021.
        </blockquote>

        <h2>Contact us</h2>
        <p class="text-body-1">
          Please use the "Contact" button in the footer or
          <a href="https://www.comses.net/about/contact/">
            use our contact form.
          </a>
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn depressed color="accent" @click.stop="acceptTerms"
          >I accept</v-btn
        >
        <v-btn
          href="https://www.openskope.org"
          outlined
          color="accent"
          @click="declineTerms"
        >
          I decline, return to www.openskope.org
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";

@Component()
class TermsOfUse extends Vue {
  showTerms = true;

  created() {
    if (process.client) {
      const warehouse = this.$warehouse;
      this.showTerms = !warehouse.get(this.termsAcceptedWarehouseKey);
      console.log("warehouse? ", this.showTerms);
    }
  }

  get termsAcceptedWarehouseKey() {
    return "skope:termsAccepted";
  }

  acceptTerms() {
    this.showTerms = false;
    this.$warehouse.set(this.termsAcceptedWarehouseKey, true);
  }

  declineTerms() {
    console.log("declining terms");
    this.$warehouse.remove(this.termsAcceptedWarehouseKey);
  }
}

export default TermsOfUse;
</script>

<style></style>
