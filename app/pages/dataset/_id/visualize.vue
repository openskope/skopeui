<template>
  <v-container fill-width fluid>
    <v-row dense align-content-start justify-space-around wrap>
      <v-col v-if="isLoadingData">
        <v-progress-circular
          v-if="isLoadingData"
          indeterminate
          color="primary"
        />
      </v-col>
      <template v-else>
        <v-col id="map-flex">
          <Map :year="yearSelected" />
        </v-col>
        <v-col>
          <TimeSeriesPlot
            :time-series="timeSeries"
            :year-selected="yearSelected"
            @yearSelected="setYear"
          />
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script>
import { Component, Watch } from 'nuxt-property-decorator'
import Map from '@/components/Map.vue'
import TimeSeriesPlot from '@/components/TimeSeriesPlot.vue'
import Vue from 'vue'
import { namespace } from 'vuex-class'
const Dataset = namespace('dataset')
const Datasets = namespace('datasets')

@Component({
  layout: 'dashboard',
  components: {
    Map,
    TimeSeriesPlot,
  },
})
class Visualize extends Vue {
  isLoadingData = true
  hasData = false

  yearSelected = 1500

  @Dataset.State('geometry')
  selectedGeometry

  @Dataset.State('layer')
  selectedLayer

  @Datasets.State('selectedDataset')
  selectedDataset

  timeSeriesUnwatcher = null

  get timeSeries() {
    const timeseries = this.$api().dataset.timeseries
    if (timeseries.x.length > 0) {
      return { ...this.$api().dataset.timeseries, type: 'scatter' }
    } else {
      return { x: [], y: [], type: 'scatter' }
    }
  }

  get minYear() {
    return parseInt(this.selectedDataset.timespan.period.gte)
  }

  get maxYear() {
    return parseInt(this.selectedDataset.timespan.period.lte)
  }

  setYear(year) {
    this.yearSelected = year
  }

  async created() {
    const d = this.$api().datasets
    await d.loadDataset(this.$route.params.id)
    this.timeSeriesUnwatcher = this.$watch(
      function () {
        const datasetUri = this.selectedLayer
          ? this.selectedLayer.timeseriesServiceUri
          : null
        return {
          datasetUri,
          geometry: this.selectedGeometry,
          minYear: this.minYear,
          maxYear: this.maxYear,
          zeroYearOffset: this.selectedDataset.timespan.period.timeZero,
        }
      },
      async function (data) {
        if (data.datasetUri) {
          await this.$api().dataset.retrieveTimeSeries(data)
        }
      }
    )
  }

  async mounted() {
    await this.updateTimeSeries()
    this.yearSelected = this.minYear
    this.isLoadingData = false
    this.hasData = true
  }

  destroyed() {
    this.timeSeriesUnwatcher()
  }

  async updateTimeSeries() {
    const api = this.$api()
    await api.dataset.retrieveTimeSeries({
      datasetUri: this.selectedDataset.timeseriesServiceUri,
      geometry: this.selectedGeometry,
      minYear: this.minYear,
      maxYear: this.minYear,
      zeroYearOffset: this.selectedDataset.timespan.period.timeZero,
    })
  }

  @Watch()
  async changeTimeSeries(data) {
    if (data.datasetUri) {
      const api = this.$api()
      await api.dataset.retrieveTimeSeries(data)
    }
  }
}

export default Visualize
</script>

<style>
#map-flex {
  height: 520px;
  margin-bottom: 2rem;
}

@media all and (max-width: 960px) {
  #map-flex {
    height: 400px;
  }
}

@media all and (max-width: 600px) {
  #map-flex {
    height: 350px;
  }
}
</style>
