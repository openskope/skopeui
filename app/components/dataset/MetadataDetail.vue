<template>
  <v-card-text>
    <v-list dense flat>
      <v-subheader class="font-weight-bold ma-0 pa-0"
        ><h3>Variables:</h3></v-subheader
      >
      <v-list-item v-for="(variable, index) in metadata.variables" :key="index">
        <v-list-item-content>
          <v-list-item-title>
            <v-chip small label color="info" text-color="black">
              {{ variable.class }}
            </v-chip>
            {{ variable.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <div v-for="(label, attr) in metadataAttributes" :key="attr" class="py-0">
      <span class="font-weight-bold">{{ label }}</span>
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
