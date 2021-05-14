<template>
  <v-row align="center" justify="center" align-content="space-around">
    <v-col class="text-center">
      <v-menu v-if="this.$vuetify.breakpoint.mdAndDown" offset-y>
        <template #activator="{ on, attrs }">
          <v-btn
            nuxt
            text
            large
            color="white"
            :class="isActiveStep(0) ? 'active' : 'button'"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon class="mx-3">{{ steps[currentStepIndex].icon }}</v-icon>
            <span class="step mx-3">{{ currentStepName }}</span>
            <v-icon class="ml-3">fas fa-caret-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(step, index) in steps"
            :key="index"
            link
            nuxt
            :disabled="isDisabled(step.id)"
            :class="isDisabled(step.id) ? 'disabled' : ''"
          >
            <component
              :is="isDisabled(step.id) ? 'span' : 'router-link'"
              :to="links[index]"
              class="text-decoration-none"
            >
              <v-icon class="mx-3">{{ steps[index].icon }}</v-icon>
              <span class="step mx-3">{{ step.label }}</span>
            </component>
          </v-list-item>
        </v-list>
      </v-menu>
      <template v-else>
        <v-btn
          nuxt
          text
          large
          color="white"
          :class="isActiveStep(0) ? 'active' : 'button'"
          :to="links[0]"
        >
          <v-icon v-if="!complete(0)">fas fa-database</v-icon>
          <v-icon v-else>fas fa-check</v-icon>
          <span class="step mx-3">Select Dataset</span>
        </v-btn>
        <v-btn
          nuxt
          text
          large
          color="white"
          :class="isActiveStep(1) ? 'active' : 'button'"
          :disabled="isDisabled(2)"
          :to="links[1]"
        >
          <v-icon v-if="!complete(1)">fas fa-map</v-icon>
          <v-icon v-else>fas fa-check</v-icon>
          <span class="step mx-3">Select Area</span>
        </v-btn>
        <v-btn
          nuxt
          text
          large
          color="white"
          :class="isActiveStep(2) ? 'active' : 'button'"
          :disabled="isDisabled(3)"
          :to="links[2]"
        >
          <v-icon v-if="!complete(2)" class="mx-3">fas fa-chart-bar</v-icon>
          <v-icon v-else>fas fa-check</v-icon>
          <span class="step mx-3">Visualize Data</span>
        </v-btn>
        <v-btn
          nuxt
          text
          large
          color="white"
          :class="isActiveStep(3) ? 'active' : 'button'"
          :disabled="isDisabled(4)"
          :to="links[3]"
        >
          <v-icon v-if="!complete(3)">fas fa-chart-line</v-icon>
          <v-icon v-else>fas fa-check</v-icon>
          <span class="step mx-3">Analyze Data</span>
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
  links = [
    this.selectDatasetLocation,
    this.selectAreaLocation,
    this.visualizeLocation,
    this.analyzeLocation,
  ];

  // --------- GETTERS ---------

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
    }
    return {};
  }

  get hasMetadata() {
    return !_.isUndefined(this.$route.params.id);
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.hasMetadata && this.$api().dataset.hasGeoJson;
  }

  get canAnalyze() {
    return this.hasValidStudyArea && this.$api().dataset.hasData;
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

  // --------- METHODS ---------

  isDisabled(stepId) {
    console.log("stepId: ", stepId);
    if (stepId === 1) {
      return false;
    } else if (stepId === 2) {
      return !this.hasMetadata;
    } else if (stepId === 3) {
      return !this.hasValidStudyArea;
    } else if (stepId === 4) {
      return !this.canAnalyze;
    } else {
      return true;
    }
  }

  complete(index) {
    return this.currentStepIndex > index;
  }

  isActiveStep(index) {
    return this.currentStepIndex === index;
  }

  created() {
    console.log("breakpoint: ", this.$vuetify.breakpoint.thresholds.md);
  }
}

export default Navigation;
</script>

<style scoped lang="sass">
@import './assets/style/variables.scss'
.step
  letter-spacing: .05em
  font: 1.5em 'Roboto', serif
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

.disabled
  opacity: 50%
</style>
