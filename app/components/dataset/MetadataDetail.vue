<template>
  <v-card-text>
    <v-list dense class="pa-0 ma-0">
      <v-subheader class="text-h6 ma-0 pa-0">Variables</v-subheader>
      <v-list-item v-for="(variable, index) in metadata.variables" :key="index">
        <v-col class="pa-0 ma-0" cols="2">
          <v-list-item-icon>
            <v-chip small label dark color="primary">
              {{ variable.class }}
            </v-chip>
          </v-list-item-icon>
        </v-col>
        <v-col class="pa-0 ma-0" cols="10">
          <v-list-item-content>
            <v-list-item-title>
              {{ variable.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-col>
      </v-list-item>
    </v-list>
    <div v-for="(label, attr) in metadataAttributes" :key="attr" class="py-0">
      <span class="text-subtitle-2">{{ label }}</span>
      <span v-html="$md.render(metadata[attr])"></span>
    </div>
  </v-card-text>
</template>

<script>
import Vue from "vue";
import { Component, Prop } from "nuxt-property-decorator";

@Component({
  name: "MetadataDetail",
})
class MetadataDetail extends Vue {
  @Prop()
  metadataId;

  get metadata() {
    return this.$api().metadata.find(this.metadataId);
  }

  get metadataAttributes() {
    return {
      originator: "Originator",
      uncertainty: "Uncertainty",
      methodSummary: "Method Summary",
      references: "References",
      contactInformation: "Contact Information",
    };
  }
}

export default MetadataDetail;
</script>
