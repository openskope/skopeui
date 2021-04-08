<template>
  <v-row align="center" justify="center" align-content="space-around">
    <v-btn
      text
      large
      color="white"
      :class="isActiveStep(0) ? 'active' : 'button'"
      @click="gotoDatasets"
    >
      <v-icon v-if="!complete(0)">fas fa-database</v-icon>
      <v-icon v-else>fas fa-check</v-icon>
      <span class="step">Select Dataset</span>
    </v-btn>
    <v-btn
      text
      large
      color="white"
      :class="isActiveStep(1) ? 'active' : 'button'"
      :disabled="!hasMetadata"
      @click="goToStudyArea($route.params.id)"
    >
      <v-icon v-if="!complete(1)">fas fa-map</v-icon>
      <v-icon v-else>fas fa-check</v-icon>
      <span class="step">Select Area</span>
    </v-btn>
    <v-btn
      text
      large
      color="white"
      :class="isActiveStep(2) ? 'active' : 'button'"
      :disabled="!hasValidStudyArea || !hasMetadata"
      @click="goToViz($route.params.id)"
    >
      <v-icon v-if="!complete(2)">fas fa-chart-bar</v-icon>
      <v-icon v-else>fas fa-check</v-icon>
      <span class="step">Visualize Data</span>
    </v-btn>
    <v-btn
      text
      large
      color="white"
      :class="isActiveStep(3) ? 'active' : 'button'"
      :disabled="!hasValidStudyArea || !hasMetadata"
      @click="goToAnalyze($route.params.id)"
    >
      <v-icon v-if="!complete(3)">fas fa-chart-line</v-icon>
      <v-icon v-else>fas fa-check</v-icon>
      <span class="step">Analyze Data</span>
    </v-btn>
  </v-row>
</template>

<script>
import Vue from 'vue';
import { Component } from 'nuxt-property-decorator';
import _ from 'lodash';

@Component()
class Navigation extends Vue {
  steps = _.cloneDeep(this.$api().app.steps);

  stepNames = _.clone(this.$api().app.stepNames);

  // --------- GETTERS ---------

  get hasMetadata() {
    return !_.isUndefined(this.$route.params.id);
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep == 0 || this.$api().dataset.hasGeoJson;
  }

  get canAnalyze() {
    return this.hasValidStudyArea && this.$api().dataset.hasData;
  }

  // --------- METHODS ---------

  complete(index) {
    return this.currentStep > index;
  }

  isActiveStep(index) {
    return this.currentStep == index;
  }

  gotoDatasets() {
    this.$router.push({ name: 'index' });
  }

  goToStudyArea(id) {
    if (_.isUndefined(id)) {
      return;
    }
    this.$router.push({ name: 'dataset-id', params: { id } });
  }

  goToViz(id) {
    if (_.isUndefined(id) || !this.hasValidStudyArea) {
      return;
    }
    this.$router.push({ name: 'dataset-id-visualize', params: { id } });
  }

  goToAnalyze(id) {
    if (_.isUndefined(id) || !this.canAnalyze) {
      return;
    }
    this.$router.push({ name: 'dataset-id-analyze', params: { id } });
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }

  get selectedDatasetId() {
    return this.$api().datasets.metadata.id;
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
  margin-left: 1rem

.button::after
  content: ''
  position: absolute
  height: 3px
  background: #fb7a2c
  width: 0
  left: 50%
  bottom: 0
  transform: translateX(-50%)
  transition: 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) all

.button:hover
  color: #fb7a2c

.button:hover::after
  width: 100%

.active
  text-decoration: none

  &::before, &::after
    content: ''
    position: absolute
    height: 3px
    background: #fb7a2c

  &::after
    width: 100%
    left: 0
    bottom: 0
    transition: all ease 0.6s
</style>
