<template>
  <v-form>
    <v-text-field
      v-model="width"
      class="mt-0 pt-0"
      hide-details
      single-line
      type="number"
    ></v-text-field>
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

  @Prop({
    validator(value) {
      return ['runningAverage', 'trailingAverage'].indexOf(value) !== -1
    },
  })
  method

  width = 7

  addVariable() {
    this.$emit('submit', {
      dataset: this.dataset,
      variable: this.variable,
      studyArea: this.studyArea,
      timeSeries: {
        yearRange: this.yearRange,
        method: this.method,
        width: this.width,
      },
    })
  }
}
export default RunningAverage
</script>
<style scoped></style>
