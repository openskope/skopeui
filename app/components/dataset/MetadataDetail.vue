<template>
  <v-card-text>
    <div v-for="(label, attr) in metadataAttributes" :key="attr" class="py-0">
      <span class="text-h5">{{ label }}</span>
      <span v-html="$md.render(metadata[attr])"></span>
    </div>
    <VariableList :variables="metadata.variables" />
  </v-card-text>
</template>

<script>
import Vue from "vue";
import { Component, Prop } from "nuxt-property-decorator";
import VariableList from "@/components/dataset/VariableList.vue";

@Component({
  name: "MetadataDetail",
  components: {
    VariableList,
  },
})
class MetadataDetail extends Vue {
  @Prop()
  metadata;

  get metadataAttributes() {
    return {
      uncertainty: "Uncertainty",
      methodSummary: "Method Summary",
      originator: "Originator",
      references: "References",
      contactInformation: "Contact Information",
    };
  }
}

export default MetadataDetail;
</script>
