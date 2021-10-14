<template>
  <v-dialog v-model="showMetadata" max-width="800px">
    <template #activator="{ on, attrs }">
      <v-btn icon depressed fab rounded v-bind="attrs" v-on="on">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-icon v-bind="attrs" color="secondary" v-on="on">
              fas fa-info-circle
            </v-icon>
          </template>
          <span>View detailed metadata for this dataset</span>
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
      <MetadataDetail :metadata-id="metadataId" />
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

  @Prop()
  metadataId;

  get metadata() {
    console.log("using metadata with id: ", this.metadataId);
    return this.$api().metadata.find(this.metadataId);
  }
}
export default MetadataModal;
</script>
