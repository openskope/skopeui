<template>
  <v-row>
    <v-col class="ml-4 mt-2 mb-0">
      <h1 class="font-weight-light">
        {{ metadata.title }}
        <v-dialog v-model="dialog" max-width="600px">
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" color="accent" depressed v-on="on">
              View Metadata
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="accent text--white">
              {{ metadata.title }}
              <v-spacer></v-spacer>
              <v-btn icon @click="dialog = false">
                <v-icon color="white">fas fa-window-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <Metadata />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="dialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <span class="float-right">
          <slot />
        </span>
      </h1>
    </v-col>
  </v-row>
</template>
<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import Metadata from "@/components/action/Metadata.vue";

@Component({
  components: { Metadata },
})
class DatasetTitle extends Vue {
  dialog = false;

  get metadata() {
    return this.$api().dataset.metadata;
  }
}
export default DatasetTitle;
</script>
