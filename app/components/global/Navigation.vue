<template>
  <v-stepper :value="currentStep + 1">
    <v-stepper-header nonlinear>
      <!-- FIXME replace step numbers with icons when step is inactive/incomplete
      https://github.com/vuetifyjs/vuetify/issues/7049 -->
      <v-stepper-step
        step="1"
        :complete="complete(0)"
        :color="complete(0) ? 'info' : 'secondary'"
        editable
        edit-icon="$complete"
        @click="goToDataSets"
        >Select Data Set</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="2"
        :complete="complete(1)"
        :color="complete(1) ? 'info' : 'secondary'"
        :editable="hasSelectedDataSet"
        edit-icon="map"
        @click="goToStudyArea($route.params.id)"
        >Define Study Area</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="3"
        :complete="complete(2)"
        :color="complete(2) ? 'info' : 'secondary'"
        :editable="hasSelectedDataSet && hasValidStudyArea"
        edit-icon="fas fa-chart-bar"
        :rules="[() => hasValidStudyArea]"
        @click="goToViz($route.params.id)"
        >Visualize Data</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="4"
        :complete="complete(3)"
        :editable="canAnalyze"
        :color="complete(3) ? 'info' : 'secondary'"
        edit-icon="$complete"
        :rules="[() => canAnalyze]"
        @click="goToAnalyze($route.params.id)"
        >Analyze Data</v-stepper-step
      >
    </v-stepper-header>
  </v-stepper>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import _ from 'lodash'

@Component()
class Navigation extends Vue {
  steps = _.cloneDeep(this.$api().app.steps)

  stepNames = _.clone(this.$api().app.stepNames)

  complete(index) {
    return this.currentStep > index
  }

  get hasSelectedDataSet() {
    return !_.isUndefined(this.$route.params.id)
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep == 0 || this.$api().dataset.hasGeometry
  }

  get canAnalyze() {
    return this.hasValidStudyArea && this.$api().dataset.hasData
  }

  // --------- GETTERS ---------

  goToDataSets() {
    this.$router.push({ name: 'index' })
  }

  goToStudyArea(id) {
    if (_.isUndefined(id)) {
      return
    }
    this.$router.push({ name: 'dataset-id', params: { id } })
  }

  goToViz(id) {
    if (_.isUndefined(id) || !this.hasValidStudyArea) {
      return
    }
    this.$router.push({ name: 'dataset-id-visualize', params: { id } })
  }

  goToAnalyze(id) {
    if (_.isUndefined(id)) {
      return
    }
    this.$router.push({ name: 'dataset-id-analyze', params: { id } })
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name)
  }

  get selectedDatasetId() {
    return this.$api().datasets.selectedDataset.id
  }
}

export default Navigation
</script>

<style lang="sass">
@import './assets/style/variables.scss'
.v-stepper__step--active
  background-color: #8bbf9f

.v-stepper__label
  font-size: 1.5rem
</style>
