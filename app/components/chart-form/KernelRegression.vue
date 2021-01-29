<template>
  <v-form>
    <v-select
      v-model="bandwidthSelection"
      label="Bandwidth Selection"
      :items="bandwidthOptions"
    >
    </v-select>
    <v-text-field
      v-show="bandwidthSelection === 'Manual'"
      v-model="width"
      class="mt-0 pt-0"
      hide-details
      single-line
      type="number"
    ></v-text-field>
    <v-select
      v-model="kernel"
      label="Bandwidth Selection"
      :items="kernelOptions"
    >
    </v-select>
    <v-btn @click="addVariable">Submit</v-btn>
  </v-form>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import { Prop } from 'vue-property-decorator'

@Component()
class RunningAverage extends Vue {
  @Prop()
  dataset

  @Prop()
  variable

  @Prop()
  studyArea

  @Prop()
  yearRange

  bandwidthOptions = ['Manual', 'AMISE']
  bandwidthSelection = 'Manual'
  width = 7
  kernelOptions = ['Epanechnikov', 'Triangle', 'Uniform']
  kernel = 'Epanechnikov'

  addVariable() {
    this.$emit('submit', {
      dataset: this.dataset,
      variable: this.variable,
      studyArea: this.studyArea,
      timeSeries: {
        yearRange: this.yearRange,
        method: 'kernelRegression',
        submethod: 'localLinear',
        selection: {
          method: this.bandwidthSelection,
          width: this.width,
        },
      },
    })
  }
}
export default RunningAverage
</script>
<style scoped></style>
