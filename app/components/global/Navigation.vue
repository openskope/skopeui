<template>
  <v-stepper>
    <v-stepper-header nonlinear>
      <v-stepper-step editable step="1">Select Data Set</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="2">Define Study Area</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3" editable>Animate Map</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="4" editable>Visualize Data</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3" editable>View Metadata</v-stepper-step>
    </v-stepper-header>
  </v-stepper>
</template>

<script>
export default {
  name: 'Navigation',
}
</script>

<style scoped></style>
