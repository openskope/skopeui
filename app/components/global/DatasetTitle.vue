<template>
  <v-row class="my-0" no-gutters align="baseline" justify="start">
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
        <v-card-title style="background-color: #6db1bf">
          <h3 class="font-weight-light" style="color: white">
            {{ metadata.title }}
          </h3>
          <v-spacer></v-spacer>
          <v-btn icon @click="showMetadata = false">
            <v-icon color="white">fas fa-times</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <Metadata />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-select
      v-if="selectVariable"
      v-model="variable"
      label="Select a variable"
      item-color="secondary"
      color="secondary"
      style="max-width: 25%; height: 0"
      dense
      :items="variables"
      item-text="name"
      item-value="id"
      outlined
      class="mx-3"
    />
    <v-spacer></v-spacer>
    <span>
      <!-- slot for next nav button -->
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

  set variable(variableId) {
    const id = this.$route.params.id;
    const name = this.$route.name;
    this.$api().dataset.setVariable(variableId);
    this.$router.push({
      name,
      params: {
        id,
        variable: variableId,
      },
    });
  }

  get variables() {
    return this.metadata.variables;
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }

  location(variable) {
    const id = this.$route.params.id;
    const name = this.$route.name;
    return {
      name,
      params: { id, variable },
    };
  }
}
export default DatasetTitle;
</script>
