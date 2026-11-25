<template>
  <client-only>
    <v-dialog
      v-model="showTerms"
      scrollable
      :aria-labelledby="titleId"
      persistent
      max-width="600"
    >
      <template #activator="{ props }">
        <button
          type="button"
          class="skope-footer__action skope-footer__dialog-trigger"
          v-bind="props"
        >
          {{ footer.labels.terms }}
        </button>
      </template>
      <v-card>
        <v-card-title><h2 :id="titleId">Terms of Use</h2></v-card-title>
        <v-card-text>
          <p class="text-body-1">{{ policy.terms }}</p>
          <ApplicationCitation />
        </v-card-text>
        <v-card-actions class="terms-actions">
          <v-btn
            href="https://www.openskope.org"
            variant="outlined"
            color="accent"
            @click="declineTerms"
          >
            I decline, return to www.openskope.org
          </v-btn>
          <v-spacer />
          <v-btn variant="flat" color="accent" @click.stop="acceptTerms"
            >I accept</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </client-only>
</template>
<script setup lang="ts">
import { ref, onMounted, useId } from "vue";
import ApplicationCitation from "@/components/ApplicationCitation.vue";
import footer from "@/vendor/web-assets/footer.json";
import policy from "@/vendor/web-assets/application-policy.json";
import { usePersistenceStorage } from "@/composables/usePersistenceStorage";

const persistenceStorage = usePersistenceStorage();
const TERMS_KEY = "skope:termsAccepted";

const showTerms = ref(true);
const titleId = useId();

onMounted(() => {
  showTerms.value = !persistenceStorage.get(TERMS_KEY);
});

function acceptTerms() {
  showTerms.value = false;
  persistenceStorage.set(TERMS_KEY, true);
}

function declineTerms() {
  persistenceStorage.remove(TERMS_KEY);
}
</script>

<style scoped>
@media (max-width: 599px) {
  .terms-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .terms-actions > .v-btn {
    height: auto;
    min-height: 44px;
    white-space: normal;
  }
}
</style>
