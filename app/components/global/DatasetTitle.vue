<template>
  <v-row justify="space-between">
    <v-col class="ml-5 mr-1 mt-4 mb-0 pb-0">
      <h1 class="font-weight-light">
        {{ metadata.title }}
        <v-select
          v-if="selectVariable"
          v-model="variable"
          label="Select a variable"
          item-color="secondary"
          color="secondary"
          style="display: inline-flex; width: 30%"
          dense
          :items="variables"
          item-text="name"
          item-value="id"
          :prepend-icon="layerGroup.icon"
          outlined
        />
        <v-dialog v-model="dialog" max-width="600px">
          <template #activator="{ on, attrs }">
            <v-btn v-bind="attrs" color="accent" depressed v-on="on">
              View Metadata
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="accent text--white">
              {{ metadata.title }}
              <v-spacer />
              <v-btn icon @click="dialog = false">
                <v-icon color="white">fas fa-window-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <Metadata />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
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
import { Component, Prop } from "nuxt-property-decorator";
import Metadata from "@/components/action/Metadata.vue";

@Component({
  components: { Metadata },
})
class DatasetTitle extends Vue {
  @Prop({ default: false })
  selectVariable;

  dialog = false;
  layerGroup = {
    icon: "fas fa-layer-group",
  };

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get variable() {
    return this.$api().dataset.variable;
  }

  set variable(id) {
    this.$api().dataset.setVariable(id);
  }

  get variables() {
    return this.metadata.variables;
  }
}
export default DatasetTitle;
</script>
