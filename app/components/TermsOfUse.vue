<template>
  <client-only>
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
            be accompanied by a citation of the original data source provided by
            SKOPE in the dataset metadata and of the SKOPE web application
            itself.
          </p>

          <h2>Example reference</h2>
          <p class="text-body-1">(SKOPE 2022)</p>

          <h2>Example Citation</h2>
          <blockquote class="blockquote">{{ citationText }}</blockquote>
          <h2>BibTeX</h2>
          <blockquote class="blockquote">{{ citationBibTex }}</blockquote>

          <h2>Contact us</h2>
          <p class="text-body-1">
            Feedback is welcome! You can reach us via the "Contact" button in
            the footer or by sending an email to
            <a href="mailto: skope-team@googlegroups.com">
              skope-team@googlegroups.com
            </a>
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn
            href="https://www.openskope.org"
            outlined
            color="accent"
            @click="declineTerms"
          >
            I decline, return to www.openskope.org
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn depressed color="accent" @click.stop="acceptTerms"
            >I accept</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </client-only>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import { CITATION_TXT, CITATION_BIB } from "@/store/modules/_constants";

@Component()
class TermsOfUse extends Vue {
  showTerms = true;

  created() {
    if (process.client) {
      this.showTerms = !this.$warehouse.get(this.termsAcceptedWarehouseKey);
    }
  }

  get citationText() {
    return CITATION_TXT;
  }

  get citationBibTex() {
    return CITATION_BIB;
  }

  get termsAcceptedWarehouseKey() {
    return "skope:termsAccepted";
  }

  acceptTerms() {
    this.showTerms = false;
    this.$warehouse.set(this.termsAcceptedWarehouseKey, true);
  }

  declineTerms() {
    this.$warehouse.remove(this.termsAcceptedWarehouseKey);
  }
}

export default TermsOfUse;
</script>

<style></style>
