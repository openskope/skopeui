<template>
  <footer class="skope-footer">
    <div class="skope-footer__inner">
      <div class="skope-footer__acknowledgments" aria-label="Acknowledgments">
        <p v-for="(paragraph, index) in footer.acknowledgments" :key="index">
          <template v-for="(segment, position) in paragraph" :key="position"
            ><a
              v-if="segment.href"
              :href="segment.href"
              target="_blank"
              rel="noopener noreferrer"
              >{{ segment.text }}</a
            ><template v-else>{{ segment.text }}</template></template
          >
        </p>
      </div>
      <div class="skope-footer__meta">
        <span
          >&copy; {{ footer.copyright.start_year }}-{{
            new Date().getFullYear()
          }}
          {{ footer.copyright.holder }}</span
        >
        <Citation />
        <TermsOfUse />
        <a
          class="skope-footer__action"
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/openskope/skopeui/"
          :aria-label="`Application source, build ${buildId}`"
        >
          <v-icon class="skope-footer__icon" aria-hidden="true"
            >mdi-github</v-icon
          >
          {{ footer.labels.build }} {{ buildId }}
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import TermsOfUse from "@/components/TermsOfUse.vue";
import Citation from "@/components/Citation.vue";
import footer from "@/vendor/web-assets/footer.json";
const { buildId } = useAppConfig();
</script>
