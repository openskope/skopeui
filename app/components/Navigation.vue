<template>
  <v-navigation-drawer v-model="navigationVisible" app light>
    <v-list dense nav>
      <v-btn-toggle v-model="currentStep" class="w-100">
        <v-btn
          v-for="(step, index) in steps"
          :key="step.id"
          nuxt
          large
          text
          tile
          :disabled="isDisabled(step.id)"
          :class="isCurrentStep(step.id) ? 'v-item--active' : 'button'"
          :to="locations[index]"
        >
          <v-icon>{{ step.icon }}</v-icon>
          <span class="step mx-3">{{ step.label }}</span>
        </v-btn>
      </v-btn-toggle>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import _ from "lodash";

@Component()
class Navigation extends Vue {
  stepNames = _.clone(this.$api().app.stepNames);
  steps = _.clone(this.$api().app.steps);
  currentStep = 1;

  // --------- GETTERS ---------

  get navigationVisible() {
    return this.$api().app.isNavigationVisible;
  }

  set navigationVisible(navigationVisible) {
    return this.$api().app.setNavigationVisible(navigationVisible);
  }

  get locations() {
    return [
      this.selectDatasetLocation,
      this.selectAreaLocation,
      this.visualizeLocation,
      this.analyzeLocation,
    ];
  }

  get selectDatasetLocation() {
    return { name: "index" };
  }

  get selectAreaLocation() {
    if (this.hasMetadata) {
      const id = this.$route.params.id;
      return { name: "dataset-id", params: { id } };
    }
    return {};
  }

  get visualizeLocation() {
    if (this.hasValidStudyArea) {
      const id = this.$route.params.id;
      const variable = this.variableId;
      return {
        name: "dataset-id-visualize-variable",
        params: { id, variable },
      };
    }
    return {};
  }

  get analyzeLocation() {
    if (this.canAnalyze) {
      const id = this.$route.params.id;
      const variable = this.variableId;
      return {
        name: "dataset-id-analyze-variable",
        params: { id, variable },
      };
    } else {
      return {};
    }
  }

  get hasMetadata() {
    return !_.isUndefined(this.$route.params.id);
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.hasMetadata && this.$api().dataset.hasGeoJson;
  }

  get canAnalyze() {
    return this.hasValidStudyArea;
  }

  get currentStepName() {
    return this.steps[this.currentStepIndex].label;
  }

  get currentStepIndex() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }

  get variableId() {
    return this.$api().dataset.variable.id;
  }

  get isMdAndDown() {
    return this.$vuetify.breakpoint.mdAndDown;
  }

  // --------- METHODS ---------

  isDisabled(stepId) {
    switch (stepId) {
      case 2:
        return !this.hasMetadata;
      case 3:
        return !this.hasValidStudyArea;
      case 4:
        return !this.canAnalyze;
      default:
        return false;
    }
  }

  complete(index) {
    return this.currentStepIndex > index;
  }

  isCurrentStep(index) {
    return this.currentStepIndex === index;
  }
}

export default Navigation;
</script>

<style scoped>
.v-btn-toggle {
  flex-direction: column;
}
</style>
