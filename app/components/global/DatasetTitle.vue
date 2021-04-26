<template>
  <v-row class="my-0 mx-4" no-gutters align="baseline" justify="start">
    <h1 class="font-weight-light">
      {{ metadata.title }}
    </h1>
    <v-dialog v-model="showMetadata" max-width="600px">
      <template #activator="{ on, attrs }">
        <v-btn icon depressed fab rounded v-bind="attrs" v-on="on">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon v-bind="attrs" color="secondary" v-on="on"
                >fas fa-info-circle</v-icon
              >
            </template>
            <span>Metadata</span>
          </v-tooltip>
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <h3 class="font-weight-light">{{ metadata.title }}</h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="showMetadata = false">
            <v-icon color="error">fas fa-times</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <Metadata />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-divider vertical></v-divider>
    <v-btn
      class="mx-4 my-auto"
      depressed
      color="accent"
      retain-focus-on-click
      @click="showInstructions = !showInstructions"
    >
      <v-tooltip v-model="showInstructions" bottom>
        <template #activator="{ attrs }">
          <span v-bind="attrs" class="font-weight-bold">Instructions</span>
        </template>
        <span>{{ instructions[currentStep] }}</span>
      </v-tooltip>
    </v-btn>
    <v-select
      v-if="selectVariable"
      v-model="variable"
      label="Select a variable"
      item-color="secondary"
      color="secondary"
      style="max-width: 19%; height: 0"
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
import _ from "lodash";

@Component({
  components: { Metadata },
})
class DatasetTitle extends Vue {
  @Prop({ default: false })
  selectVariable;

  stepNames = _.clone(this.$api().app.stepNames);
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

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }

  instructions = [
    "Welcome to the Synthesizing Knowledge of Past Environments (SKOPE) application! To examine data, click on a dataset name, pan & zoom the map, define your area of interest, then select a variable layer. ",
    "To define a selected area, use the map tools pan and zoom into the map and draw a polygon to select an area of study. When you are satisfied with your selection, click next.",
    "Instructions here",
    "Instructions here",
  ];
}
export default DatasetTitle;
</script>
