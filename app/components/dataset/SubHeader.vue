<template>
  <v-row class="my-0" no-gutters align="baseline" justify="start">
    <h1 class="font-weight-light">
      {{ metadata.title }}
    </h1>
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-btn
          icon
          depressed
          fab
          rounded
          href="https://www.openskope.org/skope-users-guide/"
          target="_blank"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="grey">fas fa-question-circle</v-icon>
        </v-btn>
      </template>
      <span>User Guide</span>
    </v-tooltip>
    <MetadataModal :metadata-id="metadata.id" />
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
import MetadataModal from "@/components/dataset/MetadataModal.vue";
import _ from "lodash";

@Component({
  components: { MetadataModal },
})
class SubHeader extends Vue {
  @Prop({ default: false })
  selectVariable;

  stepNames = _.clone(this.$api().app.stepNames);
  showInstructions = false;
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
export default SubHeader;
</script>
