<template>
  <v-dialog v-model="showTerms" :persistent="true" max-width="600">
    <v-card>
      <v-card-title class="headline">Terms of Use</v-card-title>
      <v-card-text>
        <p>
          By using the SKOPE application, you assume any risk associated with
          its use. You are solely responsible for any damage or loss you may
          incur resulting from your reliance on or use of information provided
          by SKOPE.
        </p>

        <h5>Citation</h5>
        <p>
          Use of data, graphics, or other information provided by SKOPE should
          be accompanied by a citation of the original data source (provided by
          SKOPE in the dataset metadata) and of the SKOPE web application.
        </p>

        <h5>Example reference</h5>
        <p>(SKOPE 2021)</p>

        <h5>Example Citation</h5>
        <blockquote>
          SKOPE 2021 SKOPE: Synthesizing Knowledge of Past Environments.
          https://app.openskope.org/. Accessed 1 July 2021.
        </blockquote>

        <h5>Contact us</h5>
        Please use the "Email Us" button on the navigation bar or
        <a href="https://www.comses.net/about/contact/">
          use our contact form.
        </a>
      </v-card-text>
      <v-card-actions>
        <v-btn
          href="https://www.openskope.org"
          depressed
          outlined
          color="secondary"
          text
          @click.stop="declineTerms"
        >
          I decline, return to www.openskope.org
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn depressed outlined color="accent" text @click.stop="acceptTerms">
          I accept
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import Vue from "vue";
import { Component, Prop } from "nuxt-property-decorator";

@Component()
class TermsOfUse extends Vue {
  @Prop({ default: false })
  forceShowTerms;

  warehouseTermsAccepted = false;

  created() {
    if (process.client) {
      const warehouse = this.$warehouse;
      this.warehouseTermsAccepted =
        warehouse.get(this.termsAcceptedWarehouseKey) || false;
      console.log("warehouse? ", this.warehouseTermsAccepted);
    }
  }

  get showTerms() {
    const displayTerms = this.forceShowTerms || !this.warehouseTermsAccepted;
    console.log("display terms", displayTerms);
    return displayTerms;
  }

  set showTerms(value) {
    this.$emit("input", value);
  }

  get termsAcceptedWarehouseKey() {
    return "skope:termsAccepted";
  }

  acceptTerms() {
    this.$warehouse.set(this.termsAcceptedWarehouseKey, true);
    this.$emit("input", true);
  }

  declineTerms() {
    console.log("declining terms");
    this.$warehouse.remove(this.termsAcceptedWarehouseKey);
    this.$emit("input", false);
  }
}

export default TermsOfUse;
</script>

<style></style>
