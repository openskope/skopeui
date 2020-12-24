<template>
  <v-stepper class="primary">
    <v-stepper-header nonlinear>
      <v-stepper-step
        step="1"
        :complete="complete(0)"
        :editable="$route.name !== 'index'"
        @click="goToDataSets"
        >Select Data Set</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="2"
        :complete="complete(1)"
        :editable="hasSelectedDataSet && $route.name !== 'dataset-id-studyarea'"
        @click="goToStudyArea($route.params.id)"
        >Define Study Area</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="3"
        :complete="complete(2)"
        :editable="hasSelectedDataSet && $route.name !== 'dataset-id-visualize'"
        @click="goToViz($route.params.id)"
        >Visualize Data</v-stepper-step
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
  steps = [
    {
      step: 1,
      name: 'index',
      label: 'Select Data Set',
    },
    {
      step: 2,
      name: 'dataset-id-studyarea',
      label: 'Define Study Area',
    },
    {
      step: 3,
      name: 'dataset-id-visualize',
      label: 'Visualize Data',
    },
  ]

  step_names = ['index', 'dataset-id-studyarea', 'dataset-id-visualize']

  complete(index) {
    return this.currentStep > index
  }

  get hasSelectedDataSet() {
    return !_.isUndefined(this.$route.params.id)
  }

  // --------- GETTERS ---------

  goToDataSets() {
    this.$router.push({ name: 'index' })
  }

  goToStudyArea(id) {
    if (_.isUndefined(id)) {
      return
    }
    this.$router.push({ name: 'dataset-id-studyarea', params: { id } })
  }

  goToViz(id) {
    if (_.isUndefined(id)) {
      return
    }
    this.$router.push({ name: 'dataset-id-visualize', params: { id } })
  }

  get currentStep() {
    return this.step_names.findIndex((x) => x === this.$route.name)
  }

  get isDisabled() {
    return this.$api().app.isDisabled
  }

  get selectedDatasetId() {
    return this.$api().datasets.selectedDataset.id
  }

  // --------- METHODS ---------

  selectStep(step) {
    this.e5 = step
    this.$api().app.disableDrawer(this.e5)
    this.$api().app.selectStep(this.e5)

    let action = String(this.steps.get(this.e5))

    this.$router.push({
      name: 'dataset-id-action',
      params: { id: this.selectedDatasetId, action: action },
    })
  }
}
export default Navigation
</script>

<style scoped></style>
