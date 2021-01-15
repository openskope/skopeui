<template>
  <v-container fill-width fluid>
    <v-row class="my-5">
      <h2 class="mx-3">
        {{ selectedDataset.title }}
      </h2>
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template #activator="{ on, attrs }">
          <v-btn depressed color="accent" v-bind="attrs" v-on="on"
            >View Metadata</v-btn
          >
        </template>
        <v-card>
          <v-card-title class="accent">Metadata</v-card-title>
          <v-card-text><Metadata /></v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <v-row dense align-content-start justify-space-around wrap>
      <v-col v-if="isLoadingData">
        <v-progress-circular
          v-if="isLoadingData"
          indeterminate
          color="primary"
        />
      </v-col>
      <template v-else>
        <v-col>
          <v-card flat outlined>
            <v-card-title class="secondary">Map</v-card-title>
            <Map :year="yearSelected" :opacity="opacity" class="map-flex" />
            <v-toolbar flat color="primary" class="px-1" dense>
              <v-toolbar-title class="white--text">Opacity:</v-toolbar-title>
              <v-btn icon color="white" @click="decreaseOpacity">
                <v-icon>fas fa-minus</v-icon>
              </v-btn>
              <v-btn icon color="white" @click="increaseOpacity">
                <v-icon>fas fa-plus</v-icon>
              </v-btn>
              <v-spacer></v-spacer>
              <v-toolbar-title class="white--text"
                >Year: {{ yearSelected }}CE
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-select
                v-model="layer"
                dense
                dark
                :items="layers"
                item-text="class"
                item-value="id"
                label="Select"
                color="accent"
                class="mt-5 pt-1"
                single-line
                filled
                flat
              >
              </v-select>
            </v-toolbar>
          </v-card>
        </v-col>
        <v-col>
          <v-card flat outlined>
            <v-card-title class="secondary">Time Series</v-card-title>
            <template v-if="hasTimeSeries">
              <TimeSeriesPlot
                class="timeseries-flex"
                :time-series="timeSeries"
                :year-selected="yearSelected"
                @yearSelected="setYear"
              />
              <v-toolbar color="primary" dark flat dense>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                  <v-btn icon @click="gotoFirstYear">
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                  <v-btn icon @click="previousYear">
                    <v-icon>arrow_left</v-icon>
                  </v-btn>
                  <v-btn-toggle icon background-color="indigo">
                    <v-btn text @click="togglePlay">
                      <v-icon>{{ playIcon }}</v-icon>
                    </v-btn>
                  </v-btn-toggle>
                  <v-btn icon @click="nextYear">
                    <v-icon>arrow_right</v-icon>
                  </v-btn>
                  <v-btn icon @click="gotoLastYear">
                    <v-icon>skip_next</v-icon>
                  </v-btn>
                </v-toolbar-items>
                <v-spacer></v-spacer>
              </v-toolbar>
            </template>
            <v-alert v-else color="warning">
              A study area needs to be selected for a timeseries to be displayed
            </v-alert>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script>
import { Component, Watch } from 'nuxt-property-decorator'
import Map from '@/components/Map.vue'
import Metadata from '@/components/action/Metadata.vue'
import TimeSeriesPlot from '@/components/TimeSeriesPlot.vue'
import Vue from 'vue'
import _ from 'lodash'
import { namespace } from 'vuex-class'
const Dataset = namespace('dataset')
const Datasets = namespace('datasets')
@Component({
  layout: 'BaseDataset',
  components: {
    Map,
    TimeSeriesPlot,
    Metadata,
  },
})
class Visualize extends Vue {
  animationSpeed = 2000
  hasData = false
  isAnimationPlaying = false
  isLoadingData = true
  opacityIndex = 3
  opacityLevels = _.range(0, 10).map((x) => x * 10)
  selectedAreaInSquareMeters = 0
  yearSelected = 1500
  dialog = false
  @Dataset.State('geometry')
  selectedGeometry
  @Dataset.State('layer')
  selectedLayer
  @Datasets.State('selectedDataset')
  selectedDataset
  timeSeriesUnwatcher = null
  get hasTimeSeries() {
    return this.timeSeries.x.length > 0
  }
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
  get opacity() {
    return this.opacityLevels[this.opacityIndex]
  }
  get playIcon() {
    if (this.isAnimationPlaying) {
      return 'pause_circle_filled'
    } else {
      return 'play_circle_filled'
    }
  }
  get selectedArea() {
    if (this.selectedAreaInSquareMeters > 0) {
      return Number.parseFloat(
        this.selectedAreaInSquareMeters / 1000000.0
      ).toFixed(2)
    }
  }
  set layer(l) {
    l = this.layers.find((layer) => layer.id === l)
    this.$api().datasets.selectVariable(l.id)
    this.$api().dataset.setLayer(l)
  }
  get layer() {
    return this.$api().dataset.layer
  }
  get layers() {
    return this.selectedDataset.variables
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
  decreaseOpacity() {
    this.opacityIndex = _.clamp(this.opacityIndex + 1, 0, 10)
  }
  increaseOpacity() {
    this.opacityIndex = _.clamp(this.opacityIndex - 1, 0, 10)
  }
  exportSelectedGeometry(event) {
    const geometry = this.getSavedGeometry()
    if (geometry) {
      const convertedArea =
        'text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(geometry))
      const button = document.getElementById('exportSelectedGeometry')
      button.setAttribute('href', 'data:' + convertedArea)
      button.setAttribute('download', `${this.wGeometryKey}.geojson`)
    }
  }
  getSavedGeometry() {
    const skopeGeometry = this.$warehouse.get(this.wGeometryKey)
    if (skopeGeometry) {
      return JSON.parse(skopeGeometry)
    }
    return false
  }
  gotoFirstYear() {
    if (this.selectedLayer === null) {
      return
    }
    this.setYear(this.minYear)
  }
  gotoLastYear() {
    if (this.selectedLayer === null) {
      return
    }
    this.setYear(this.maxYear)
  }
  nextYear() {
    if (this.selectedLayer === null) {
      return
    }
    this.setYear(_.clamp(this.yearSelected + 1, this.minYear, this.maxYear))
  }
  previousYear() {
    if (this.selectedLayer === null) {
      return
    }
    this.setYear(_.clamp(this.yearSelected - 1, this.minYear, this.maxYear))
  }
  togglePlay(event) {
    this.isAnimationPlaying = !this.isAnimationPlaying
    if (this.isAnimationPlaying) {
      // start an interval
      const animationInterval = setInterval(() => {
        if (!this.isAnimationPlaying) {
          clearInterval(animationInterval)
          return
        }
        this.nextYear()
      }, this.animationSpeed)
    }
  }
  loadGeoJson(event) {
    const file = event.target.files[0]
    file.text().then((text) => {
      console.log('received possible geojson to load: ', text)
      try {
        let area = JSON.parse(text)
        this.restoreSelectedGeometry(area)
      } catch (error) {
        console.error(error)
        // FIXME: this should be a toast or other notification
        alert("Sorry! We couldn't re-import this file: " + text)
      }
    })
  }
  selectGeoJsonFile() {
    document.getElementById('loadGeoJsonFile').click()
  }
  setYear(year) {
    this.yearSelected = year
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
    if (data.datasetUri && data.selectedGeometry.type !== 'None') {
      const api = this.$api()
      await api.dataset.retrieveTimeSeries(data)
    }
  }
}
export default Visualize
</script>

<style>
#exportSelectedGeometry {
  text-decoration: none;
  color: inherit;
}
.map-flex {
  height: calc(70vh - 96px);
}
.timeseries-flex {
  height: calc(70vh - 96px);
}
@media all and (max-width: 960px) {
  .map-flex {
    height: 400px;
  }
  .timeseries-flex {
    height: 400px;
  }
}
@media all and (max-width: 600px) {
  .map-flex {
    height: 350px;
  }
  .timeseries-flex {
    height: 350px;
  }
}
</style>
