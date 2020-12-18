<template>
  <v-container fill-width fluid>
    <v-row dense align-conent-center justify-space-around wrap>
      <v-col>
        <!-- toolbar -->
        <v-toolbar color="indigo" dark dense>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                icon
                v-on="on"
                @click="exportSelectedGeometry"
              >
                <a id="exportSelectedGeometry">
                  <v-icon>fas fa-download</v-icon>
                </a>
              </v-btn>
            </template>
            <span>Download selected geometry as a GeoJSON file</span>
          </v-tooltip>
          <input
            id="loadGeoJsonFile"
            type="file"
            style="display: none"
            @change="loadGeoJson"
          />
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" icon v-on="on" @click="selectGeoJsonFile">
                <v-icon>fas fa-upload</v-icon>
              </v-btn>
            </template>
            <span>Upload a GeoJSON file</span>
          </v-tooltip>
          <template v-if="selectedArea > 0">
            Selected area: {{ selectedArea }} km<sup>2</sup>
          </template>
          <v-spacer></v-spacer>
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
        </v-toolbar>
      </v-col>
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
        <v-col id="map-flex">
          <Map :year="yearSelected" />
        </v-col>
        <v-col>
          <TimeSeriesPlot
            v-if="hasTimeSeries"
            :time-series="timeSeries"
            :year-selected="yearSelected"
            @yearSelected="setYear"
          />
          <v-alert v-else color="blue lighten-2">
            A study area needs to be selected for a timeseries to be displayed
          </v-alert>
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
import { clamp } from 'lodash'
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
  animationSpeed = 2000
  hasData = false
  isAnimationPlaying = false
  isLoadingData = true
  selectedAreaInSquareMeters = 0
  yearSelected = 1500

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
    this.setYear(clamp(this.yearSelected + 1, this.minYear, this.maxYear))
  }

  previousYear() {
    if (this.selectedLayer === null) {
      return
    }
    this.setYear(clamp(this.yearSelected - 1, this.minYear, this.maxYear))
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
