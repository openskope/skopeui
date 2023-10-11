<template>
  <client-only>
    <v-dialog v-model="showCitation" width="auto">
      <template #activator="{ on, props }">
        <v-btn
          style="font-weight: bold"
          color="white"
          class="text-body-1"
          plain
          v-bind="props"
          v-on="on"
        >
          Cite SKOPE
        </v-btn>
      </template>
      <v-card>
        <v-card-title><h2>How to Cite SKOPE</h2></v-card-title>
        <v-card-text>
          <h2>Citation</h2>
          <p class="text-body-1 px-2">
            Use of data, graphics, or other information provided by SKOPE should
            be accompanied by a citation of the original data source provided by
            SKOPE in the dataset metadata and of the SKOPE web application
            itself.
          </p>

          <h2>Example Citation (click text to copy)</h2>
          <v-textarea
            v-model="citationText"
            class="blockquote"
            readonly
            no-resize
            @click="copyToClipboard"
          >
          </v-textarea>
          <h2>BibTeX (click text to copy)</h2>
          <v-textarea
            v-model="citationBibTex"
            class="blockquote"
            readonly
            no-resize
            @click="copyToClipboard"
          >
          </v-textarea>

          <h2>Contact us</h2>
          <p class="text-body-1 px-2">
            Feedback is welcome! You can reach us via the "Contact" button in
            the footer or by sending an email to
            <a href="mailto: skope-team@googlegroups.com">
              skope-team@googlegroups.com
            </a>
          </p>
          <v-snackbar v-model="clipboardMessage" timeout="6000">
            <p class="text-center">
              Citation text copied to clipboard. Use <kbd>Ctrl + V</kbd> to
              paste.
            </p>
          </v-snackbar>
        </v-card-text>
      </v-card>
    </v-dialog>
  </client-only>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import { CITATION_TXT, CITATION_BIB } from "@/store/modules/_constants";

@Component()
class Citation extends Vue {
  showCitation = false;
  clipboardMessage = false;

  get citationText() {
    return CITATION_TXT;
  }

  get citationBibTex() {
    return CITATION_BIB;
  }

  copyToClipboard(evt, data) {
    const srcElement = evt.srcElement;
    const citationText = srcElement.value;
    navigator.clipboard.writeText(citationText).then(() => {
      srcElement.select();
      this.clipboardMessage = true;
    });
  }
}

export default Citation;
</script>

<style></style>
