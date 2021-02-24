<template>
  <v-responsive :aspect-ratio="16 / 9">
    <!-- title and instructions -->
    <v-row class="my-5">
      <h1 class="ml-5 my-auto font-weight-light">
        {{ selectedDataset.title }}
      </h1>
      <v-chip outlined label color="secondary" class="ml-3 my-auto">
        <v-icon class="mr-2" small>{{ layerGroup.icon }}</v-icon>
        <span v-if="selectedLayer === null">No variable selected</span>
        <span v-else>{{ selectedLayer.name }}</span>
      </v-chip>
      <v-tooltip bottom
        ><template #activator="{ on, attrs }">
          <v-btn icon color="secondary" class="mx-3">
            <v-icon
              v-bind="attrs"
              large
              @click="instructions = !instructions"
              v-on="on"
              >info</v-icon
            >
          </v-btn> </template
        ><span>Instructions</span></v-tooltip
      >
      <v-dialog v-model="dialog" max-width="600px">
        <template #activator="{ on, attrs }">
          <v-btn depressed color="accent" v-bind="attrs" v-on="on"
            >View Metadata</v-btn
          >
        </template>
        <v-card>
          <v-card-title class="accent">
            Metadata
            <v-spacer></v-spacer>
            <v-btn icon @click="dialog = false">
              <v-icon color="white">fas fa-window-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text><Metadata /></v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-spacer></v-spacer>
      <v-btn
        color="accent"
        depressed
        :disabled="!hasValidStudyArea"
        class="mr-4"
        @click="goToAnalyze($route.params.id)"
        >Go to Analyze
        <v-icon small class="ml-2" color="white"
          >fas fa-chevron-right</v-icon
        ></v-btn
      >
    </v-row>
    <!-- dismissable instructions -->
    <v-row>
      <v-col class="mx-auto">
        <v-alert
          v-model="instructions"
          color="secondary"
          text
          outlined
          dismissible
        >
          For the geometry of your selected area, you can modify the opacity and
          variable layer. The Time Series chart will automatically update upon
          selecting a layer. After you are finished, you can continue to the
          analysis step.
        </v-alert>
      </v-col>
    </v-row>
    <!-- map and time series plot -->
    <v-row dense align-content-start justify-space-around wrap>
      <!-- loading animation -->
      <v-col v-if="isLoadingData">
        <v-progress-circular
          v-if="isLoadingData"
          indeterminate
          color="primary"
        />
      </v-col>
      <!-- map and toolbar controls-->
      <template v-else>
        <v-col>
          <v-card class="map pa-3 mb-5" elevation="2" outlined shaped>
            <v-card-title>
              <h1 class="headline mr-3">Map</h1>
              <v-spacer></v-spacer>
              <h3 class="headline">
                Selected area: {{ selectedArea }} km<sup>2</sup>
              </h3>
            </v-card-title>
            <Map :year="yearSelected" :opacity="opacity" class="map-flex" />
            <v-toolbar flat extended extension-height="25" class="pt-8">
              <v-row>
                <v-col cols="2">
                  <v-toolbar-title>Opacity</v-toolbar-title>
                  <v-toolbar-items class="my-auto">
                    <v-btn icon color="secondary">
                      <v-icon small @click="decreaseOpacity"
                        >fas fa-minus</v-icon
                      >
                    </v-btn>
                    <span class="mx-3"> {{ opacity }}</span>
                    <v-btn icon small color="secondary">
                      <v-icon @click="increaseOpacity">fas fa-plus</v-icon>
                    </v-btn>
                  </v-toolbar-items>
                </v-col>
                <v-col cols="6" class="mx-3">
                  <v-toolbar-title>Temporal Range</v-toolbar-title>
                  <v-toolbar-items>
                    <v-range-slider
                      v-model="temporalRange"
                      dense
                      track-color="info"
                      color="accent"
                      hint="CE"
                      :max="maxYear"
                      :min="minYear"
                    >
                      <template #prepend>
                        <v-text-field
                          :value="temporalRange[0]"
                          class="mt-0 pt-0"
                          hide-details
                          single-line
                          type="number"
                          style="width: 60px"
                          @change="$set(temporalRange, 0, $event)"
                        ></v-text-field>
                      </template>
                      <template #append>
                        <v-text-field
                          :value="temporalRange[1]"
                          class="mt-0 pt-0"
                          hide-details
                          single-line
                          type="number"
                          style="width: 60px"
                          @change="$set(temporalRange, 1, $event)"
                        ></v-text-field>
                      </template>
                    </v-range-slider>
                  </v-toolbar-items>
                </v-col>
                <v-col>
                  <v-toolbar-title>Variable</v-toolbar-title>
                  <v-toolbar-items
                    ><v-select
                      v-model="layer"
                      label="Select a variable"
                      item-color="secondary"
                      color="secondary"
                      dense
                      :items="layers"
                      item-text="name"
                      item-value="id"
                      class="my-auto"
                      :style="'width: 6rem'"
                      :prepend-icon="layerGroup.icon"
                      single-line
                      outlined
                    >
                    </v-select
                  ></v-toolbar-items>
                </v-col>
              </v-row>
            </v-toolbar>
          </v-card>
        </v-col>
        <v-col>
          <v-card class="pa-3 mb-5" elevation="2" outlined shaped>
            <h1 class="headline mt-3 ml-3">Time Series</h1>
            <template v-if="hasTimeSeries">
              <TimeSeriesPlot
                class="timeseries-flex"
                :time-series="timeSeries"
                :year-selected="yearSelected"
                @yearSelected="setYear"
              />
              <v-toolbar flat extended extension-height="25" class="pt-8">
                <v-spacer></v-spacer>
                <v-toolbar-items>
                  <v-btn icon color="secondary" @click="gotoFirstYear">
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                  <v-btn icon color="secondary" @click="previousYear">
                    <v-icon>arrow_left</v-icon>
                  </v-btn>
                  <v-btn-toggle icon class="my-auto">
                    <v-btn icon @click="togglePlay">
                      <v-icon color="secondary">{{ playIcon }}</v-icon>
                    </v-btn>
                  </v-btn-toggle>
                  <v-btn icon color="secondary" @click="nextYear">
                    <v-icon>arrow_right</v-icon>
                  </v-btn>
                  <v-btn icon color="secondary" @click="gotoLastYear">
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
  </v-responsive>
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
  yearSelected = 1500
  dialog = false
  instructions = true
  layerGroup = {
    icon: 'fas fa-layer-group',
  }
  @Dataset.State('geometry')
  selectedGeometry
  @Dataset.State('layer')
  selectedLayer
  @Datasets.State('selectedDataset')
  selectedDataset
  timeSeriesUnwatcher = null
  stepNames = _.clone(this.$api().app.stepNames)
  temporalRange = [1, 2017]

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name)
  }
  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep == 0 || this.$api().dataset.hasGeometry
  }
  goToAnalyze(id) {
    if (_.isUndefined(id)) {
      return
    }
    this.$router.push({ name: 'dataset-id-analyze', params: { id } })
  }
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
    return (this.$api().dataset.selectedAreaInSquareMeters / 1000000.0).toFixed(
      2
    )
  }

  set layer(l) {
    l = this.layers.find((layer) => layer.id === l)
    this.$api().datasets.selectVariable(l.id)
    this.$api().dataset.setLayer(l)
  }
  get layer() {
    if (_.size(this.layers) > 1) return ''
    else return this.$api().dataset.layer
  }
  get layers() {
    return this.selectedDataset.variables
  }

  set selectedLayer(layer) {
    this.selectedLayer = layer
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
          minYear: this.temporalRange[0],
          maxYear: this.temporalRange[1],
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
    this.timeSeriesUnwatcher
  }
  decreaseOpacity() {
    this.opacityIndex = _.clamp(this.opacityIndex - 1, 0, 10)
  }
  increaseOpacity() {
    this.opacityIndex = _.clamp(this.opacityIndex + 1, 0, 10)
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
}
export default Visualize
</script>

<style scoped>
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
.v-toolbar__title {
  color: #fb7a2c;
  text-transform: uppercase;
  font-size: 1rem;
  font-weight: bold;
}
.v-toolbar__items {
  margin-top: 0.5rem;
}
</style>
