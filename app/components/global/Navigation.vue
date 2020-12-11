<template>
  <v-stepper v-model="e5" class="primary">
    <v-stepper-header nonlinear>
      <v-stepper-step
        step="1"
        :complete="e5 > 1"
        editable
        @click="selectStep(1)"
        >Select Data Set</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="2"
        :complete="e5 > 2"
        editable
        @click="selectStep(2)"
        >Define Study Area</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="3"
        :complete="e5 > 3"
        editable
        @click="selectStep(3)"
        >Visualize Data</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="4"
        :complete="e5 > 4"
        editable
        @click="selectStep(4)"
        >Analyze Data</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="5"
        :complete="e5 > 5"
        editable
        @click="selectStep(5)"
        >View Metadata</v-stepper-step
      >
    </v-stepper-header>
  </v-stepper>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
@Component()
class Navigation extends Vue {
  e5 = 1
  steps = new Map([
    [1, '#'],
    [2, 'study'],
    [3, 'visualize'],
    [4, 'analyze'],
    [5, 'metadata'],
  ])

  // --------- GETTERS ---------

  get currentStep() {
    return this.$api().app.currentStep
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
