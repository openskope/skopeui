<template>
  <v-responsive :aspect-ratio="16 / 9">
    <v-row class="my-5">
      <h2 class="mx-3">
        {{ selectedDataset.title }}
        <small class="font-weight-thin"
          >(selected area: 100km<sup>2</sup>)</small
        >
      </h2>
    </v-row>
    <v-row dense align-content-start justify-space-around wrap>
      <v-col cols="9">
        <TimeSeriesPlot class="timeseries-flex" :time-series="timeSeries" />
      </v-col>
      <v-col cols="3">
        <v-card flat outlined>
          <v-card-title class="secondary">{{
            selectedVariable.name
          }}</v-card-title>
          <v-form>
            <v-select
              v-model="selectedZonalStatistic"
              item-text="label"
              item-value="id"
              label="Zonal Statistic"
              :items="zonalStatisticOpts"
            />
            <v-row v-if="temporalResolution !== ''">
              <v-col>
                <v-text-field
                  v-model="timeRange.lb.year"
                  dense
                  label="Year (Lower Bound)"
                  type="number"
                />
              </v-col>
              <v-col v-if="temporalResolution === 'month'">
                <v-text-field
                  v-model="timeRange.lb.month"
                  dense
                  label="Month (Lower Bound)"
                  type="number"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="timeRange.ub.year"
                  dense
                  label="Year (Upper Bound)"
                  type="number"
                />
              </v-col>
              <v-col v-if="temporalResolution === 'month'">
                <v-text-field
                  v-model="timeRange.ub.month"
                  dense
                  label="Month (Upper Bound)"
                  type="number"
                />
              </v-col>
            </v-row>
            <v-select
              v-model="selectedSmoother"
              item-text="label"
              item-value="id"
              label="Smoother"
              :items="smootherOpts"
            ></v-select>
            <v-text-field
              v-show="
                ['trailingAverage', 'centeredAverage'].indexOf(
                  selectedSmoother
                ) !== -1
              "
              v-model="width"
              label="Width (# of days)"
              type="number"
            />
            <v-select
              v-model="selectedScaleTransform"
              item-text="label"
              item-value="id"
              label="Scale Transform"
              :items="scaleTransformOpts"
            />
            <v-btn @click="submit">Submit</v-btn>
          </v-form>
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

  selectedZonalStatistic = 'mean'

  zonalStatisticOpts = [
    {
      label: 'Mean',
      id: 'mean',
    },
    {
      label: 'Median',
      id: 'median',
    },
  ]

  timeRange = {
    lb: {
      year: 1500,
      month: 1,
    },
    ub: {
      year: 1800,
      month: 1,
    },
  }

  selectedSmoother = 'none'

  smootherOpts = [
    {
      label: 'None',
      id: 'none',
    },
    {
      label: 'Moving Average (Trailing)',
      id: 'trailingAverage',
    },
    {
      label: 'Moving Average (Centered)',
      id: 'centeredAverage',
    },
    {
      label: 'Polynomial Spline',
      id: 'polynomialSpline',
    },
  ]

  width = 7

  selectedScaleTransform = 'none'

  scaleTransformOpts = [
    {
      label: 'None',
      id: 'none',
    },
    {
      label: 'Z-Score',
      id: 'zscore',
    },
  ]

  get temporalResolution() {
    return this.selectedDataset.timespan.resolution
  }

  get timeSeries() {
    const timeseries = this.$api().dataset.timeseries
    if (timeseries.x.length > 0) {
      return { ...this.$api().dataset.timeseries, type: 'scatter' }
    } else {
      return { x: [], y: [], type: 'scatter' }
    }
  }

  submit() {
    console.log('submitting to web service')
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
