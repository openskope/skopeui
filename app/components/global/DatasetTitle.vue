<template>
  <v-row class="d-flex d-inline mt-2 mb-0 mx-4" no-gutters>
    <h1 class="font-weight-light">
      {{ metadata.title }}
    </h1>
    <v-dialog v-model="showMetadata" max-width="600px">
      <template #activator="{ on, attrs }">
        <v-btn
          icon
          depressed
          rounded
          class="ml-2 mr-0"
          v-bind="attrs"
          v-on="on"
        >
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon v-bind="attrs" v-on="on">fas fa-info-circle</v-icon>
            </template>
            <span>Metadata</span>
          </v-tooltip>
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          {{ metadata.title }}
          <v-spacer></v-spacer>
          <v-btn icon @click="showMetadata = false">
            <v-icon>fas fa-times</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <Metadata />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-divider vertical class="mx-4"></v-divider>
    <v-btn outlined @click="showInstructions = !showInstructions">
      <!-- FIXME: refactor tooltip to wrap components on the page -->
      <v-tooltip v-model="showInstructions" bottom>
        <template #activator="{ on, attrs }">
          <span v-bind="attrs" v-on="on">Instructions</span>
        </template>
        <span>The less I know the better...</span>
      </v-tooltip>
    </v-btn>
    <v-select
      v-if="selectVariable"
      v-model="variable"
      label="Select a variable"
      item-color="secondary"
      color="secondary"
      style="max-width: 19%; height: 0"
      success
      dense
      :items="variables"
      item-text="name"
      item-value="id"
      outlined
      class="no-gutters mx-3"
    />
    <v-spacer></v-spacer>
    <span>
      <slot />
    </span>
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

  showInstructions = false;
  showMetadata = false;
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
