<template>
  <v-responsive :aspect-ratio="16 / 9">
    <v-row class="my-5">
      <h2 class="mx-3">
        {{ selectedDataset.title }}
      </h2>
    </v-row>
    <v-row dense align-content-start justify-space-around wrap>
      <v-col cols="9">
        <TimeSeriesPlot class="timeseries-flex" :time-series="timeSeries" />
      </v-col>
      <v-col cols="3">
        <v-card flat outlined>
          <v-card-title class="secondary">Series</v-card-title>
          <v-select
            v-model="selectedPlotType"
            item-text="label"
            item-value="id"
            label="Plot Type"
            :items="plotOpts"
          ></v-select>
          <RunningAverage
            v-if="selectedPlotType === 'trailingAverage'"
            :dataset="selectedDataset.id"
            :method="'trailingAverage'"
            :study-area="selectedStudyArea"
            :variable="selectedVariable.id"
            :year-range="[0, 2000]"
          />
          <RunningAverage
            v-else-if="selectedPlotType === 'runningAverage'"
            :dataset="selectedDataset.id"
            :method="'runningAverage'"
            :study-area="selectedStudyArea"
            :variable="selectedVariable.id"
            :year-range="[0, 2000]"
          />
          <KernelRegression
            v-else
            :dataset="selectedDataset.id"
            :study-area="selectedStudyArea"
            :variable="selectedVariable.id"
            :year-range="[0, 2000]"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-responsive>
</template>

<script>
import KernelRegression from '@/components/chart-form/KernelRegression.vue'
import RunningAverage from '@/components/chart-form/RunningAverage.vue'
import TimeSeriesPlot from '@/components/TimeSeriesPlot.vue'
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import { namespace } from 'vuex-class'

const Datasets = namespace('datasets')
const Dataset = namespace('dataset')
@Component({
  layout: 'BaseDataset',
  components: {
    KernelRegression,
    RunningAverage,
    TimeSeriesPlot,
  },
})
class Analyze extends Vue {
  @Datasets.State('selectedDataset')
  selectedDataset

  @Dataset.State('layer')
  selectedVariable

  @Dataset.State('geometry')
  selectedStudyArea

  selectedPlotType = 'trailingAverage'

  plotOpts = [
    {
      label: 'Trailing Average',
      id: 'trailingAverage',
    },
    {
      label: 'Running Average',
      id: 'runningAverage',
    },
    {
      label: 'Polynomial Spline',
      id: 'polynomialSpline',
    },
    {
      label: 'Kernel Regression',
      id: 'kernelRegression',
    },
  ]

  get timeSeries() {
    const timeseries = this.$api().dataset.timeseries
    if (timeseries.x.length > 0) {
      return { ...this.$api().dataset.timeseries, type: 'scatter' }
    } else {
      return { x: [], y: [], type: 'scatter' }
    }
  }

  async created() {
    console.log(this.$route.params.action)
  }
}
export default Analyze
</script>

<style scoped>
.timeseries-flex {
  height: calc(70vh - 96px);
}
@media all and (max-width: 960px) {
  .timeseries-flex {
    height: 400px;
  }
}
@media all and (max-width: 600px) {
  .timeseries-flex {
    height: 350px;
  }
}
</style>
