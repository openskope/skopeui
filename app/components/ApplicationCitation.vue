<template>
  <h2>Citation</h2>
  <p class="text-body-1 px-2">{{ policy.citationGuidance }}</p>
  <CitationText label="Example citation" :text="citationText" />
  <CitationText label="BibTeX" :text="citationBibTex" />
  <h2>Contact us</h2>
  <p class="text-body-1 px-2">
    Feedback is welcome! Send an email to
    <a href="mailto:skope-team@googlegroups.com">skope-team@googlegroups.com</a
    >.
  </p>
</template>
<script setup lang="ts">
import CitationText from "@/components/CitationText.vue";
import policy from "@/vendor/web-assets/application-policy.json";
import citationText from "@/generated/citation.txt?raw";
import citationBibTex from "@/generated/citation.bib?raw";
</script>
