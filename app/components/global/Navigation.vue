<template>
  <v-row class="text-center">
    <v-col>
      <!-- FIXME: steps are tightly coupled to this nav component; consider moving steps from store/app into this component -->
      <!-- minimized nav menu -->
      <h1 v-if="isMdAndDown" offset-y style="color: white">
        <span style="border-bottom: #ee6c4d solid" class="pb-2">
          <v-icon large color="white" class="mx-2">{{
            steps[currentStepIndex].icon
          }}</v-icon>
          {{ currentStepName }}
        </span>
      </h1>
      <!-- full size nav -->
      <template v-else>
        <v-btn
          v-for="(step, index) in steps"
          :key="index"
          nuxt
          text
          color="white"
          :disabled="isDisabled(step.id)"
          :class="{
            active: isActiveStep(index),
            button: !isActiveStep(index),
            disabled: isDisabled(step.id),
          }"
          :to="locations[index]"
        >
          <v-icon v-if="!complete(index)">{{ step.icon }}</v-icon>
          <v-icon v-else>fas fa-check</v-icon>
          <span class="step mx-3">{{ step.label }}</span>
        </v-btn>
      </template>
    </v-col>
  </v-row>
</template>

<script>
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import _ from "lodash";

@Component()
class Navigation extends Vue {
  stepNames = _.clone(this.$api().app.stepNames);
  steps = _.clone(this.$api().app.steps);

  // --------- GETTERS ---------

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

  isActiveStep(index) {
    return this.currentStepIndex === index;
  }
}

export default Navigation;
</script>

<style scoped lang="sass">
@import './assets/style/variables.scss'
.step
  letter-spacing: .05em
  font: 1.75em 'Roboto', serif
  text-transform: capitalize

.button::after
  content: ''
  position: absolute
  height: 3px
  background: #EE6C4D
  width: 0
  left: 50%
  bottom: 0
  transform: translateX(-50%)
  transition: 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) all

.button:hover
  color: #EE6C4D

.button:hover::after
  width: 100%

.active
  text-decoration: none

  &::before, &::after
    content: ''
    position: absolute
    height: 3px
    background: #EE6C4D
    width: 0

  &::after
    width: 100%
    left: 0
    bottom: 0
    transition: all ease 0.6s
</style>
