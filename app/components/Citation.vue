<template>
  <client-only>
    <v-dialog
      v-model="showCitation"
      scrollable
      :aria-labelledby="titleId"
      max-width="800"
    >
      <template #activator="{ props }">
        <button
          type="button"
          class="skope-footer__action skope-footer__dialog-trigger"
          v-bind="props"
        >
          {{ footer.labels.citation }}
        </button>
      </template>
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <h2 :id="titleId" class="text-wrap">How to Cite SKOPE</h2>
          <v-spacer />
          <v-btn
            icon="mdi-close"
            class="flex-shrink-0"
            variant="text"
            aria-label="Close citation"
            @click="showCitation = false"
          />
        </v-card-title>
        <v-card-text>
          <ApplicationCitation />
        </v-card-text>
      </v-card>
    </v-dialog>
  </client-only>
</template>
<script setup lang="ts">
import { ref, useId } from "vue";
import ApplicationCitation from "@/components/ApplicationCitation.vue";
import footer from "@/vendor/web-assets/footer.json";

const showCitation = ref(false);
const titleId = useId();
</script>
