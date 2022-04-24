<template>
  <v-dialog v-model="showMetadata" max-width="800px">
    <template #activator="{ on, attrs }">
      <v-btn icon depressed x-small fab rounded v-bind="attrs" v-on="on">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-icon v-bind="attrs" color="red accent-4" v-on="on">
              fas fa-exclamation-triangle
            </v-icon>
          </template>
          <span>
            View dataset metadata with <strong>important details</strong> on
            <strong>uncertainty</strong> and <strong>provenance</strong>
          </span>
        </v-tooltip>
      </v-btn>
    </template>
    <v-card>
      <v-card-title style="background-color: #6db1bf">
        <h3 class="font-weight-light" style="color: white">
          {{ metadata.title }}
        </h3>
        <v-spacer></v-spacer>
        <v-btn icon @click="showMetadata = false">
          <v-icon color="white">fas fa-times</v-icon>
        </v-btn>
      </v-card-title>
      <MetadataDetail :metadata="metadata" />
    </v-card>
  </v-dialog>
</template>
<script>
import Vue from "vue";
import { Component, Prop } from "nuxt-property-decorator";
import MetadataDetail from "@/components/dataset/MetadataDetail.vue";

@Component({
  components: { MetadataDetail },
})
class MetadataModal extends Vue {
  showMetadata = false;

  @Prop({})
  metadataId;

  get metadata() {
    return this.$api().metadata.find(this.metadataId);
  }
}
export default MetadataModal;
</script>
