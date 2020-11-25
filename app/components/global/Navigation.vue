<template>
  <v-stepper v-model="e5">
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
        >Animate Map</v-stepper-step
      >
      <v-divider></v-divider>
      <v-stepper-step
        step="4"
        :complete="e5 > 4"
        editable
        @click="selectStep(4)"
        >Visualize Data</v-stepper-step
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
import { App, STEPS } from '@/store/app'

@Component()
class Navigation extends Vue {
  data() {
    return {
      e5: 1,
      totalSteps: 5,
    }
  }

  get currentStep() {
    return this.$api().app.currentStep
  }

  selectStep(step) {
    this.e5 = step
    console.log('hi')
    this.$api().app.setStep(step)
  }
}
export default Navigation
</script>

<style scoped></style>
