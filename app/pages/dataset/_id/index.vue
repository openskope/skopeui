<template>
  <v-container fill-width fluid>
    <v-layout row pa-2 mb-2 align-content-start justify-space-around wrap>
      <v-flex id="map-flex" xs12 md6>
        <div class="map px-2">
          <no-ssr placeholder="Loading map, please wait...">
            <l-map
              ref="layerMap"
              :zoom="selectedDataset.region.zoom"
              :center="selectedDataset.region.center"
              :draw-control="true"
              style="z-index: 2"
            >
              <l-control-scale />
              <l-control-layers />
              <l-tile-layer
                :url="defaultBaseMap.url"
                :attribution="defaultBaseMap.attribution"
                :transparent="false"
              />
              <l-rectangle
                :bounds="selectedDataset.region.extents"
                :l-style="selectedDataset.region.style"
                :fill-opacity="0.05"
              />
              <l-wms-tile-layer
                v-for="variable of selectedDataset.variables"
                ref="wmsLayers"
                :key="variable.wmsLayer"
                :base-url="skopeWmsUrl"
                :layers="fillTemplateYear(variable.wmsLayer)"
                :name="variable.name"
                :crs="defaultCrs"
                :transparent="true"
                :opacity="0.5"
                :layer-type="layerType"
                :attribution="variable.name"
                :visible="variable.visible"
                version="1.3.0"
                format="image/png"
              />
            </l-map>
          </no-ssr>
        </div>
        <v-form>
          <v-container py-0>
            <v-subheader class="text-lg-center text-md-center pa-0">
              Constrain the animation temporal range (in years) and animate the
              selected variable
            </v-subheader>
            <v-layout class="align-center justify-center" row>
              <v-flex xs12 sm6 class="py-0">
                <v-alert
                  :value="!isLayerSelected"
                  type="error"
                  transition="scale-transition"
                >
                  Please select a variable first from the layer control on the
                  map.
                </v-alert>
                <v-alert
                  :value="isLayerSelected"
                  type="info"
                  transition="scale-transition"
                >
                  {{ selectedLayerName }}
                </v-alert>
                <v-toolbar collapse>
                  <v-btn flat @click="previousYear">
                    <v-icon>skip_previous</v-icon>
                  </v-btn>
                  <v-btn-toggle class="transparent">
                    <v-btn flat @click="togglePlay">
                      <v-icon>{{ playIcon }}</v-icon>
                    </v-btn>
                  </v-btn-toggle>
                  <v-btn flat @click="nextYear">
                    <v-icon>skip_next</v-icon>
                  </v-btn>
                </v-toolbar>
              </v-flex>
            </v-layout>
            <v-layout align-center justify-space-between row>
              <v-flex shrink style="width: 6em">
                <v-text-field
                  v-model="minTemporalRange"
                  class="centered-input mt-0"
                  :min="timespanMinYear"
                  :max="timespanMaxYear"
                  :validate-on-blur="true"
                  hide-details
                  single-line
                  type="number"
                  @change="validateMinYear"
                ></v-text-field>
              </v-flex>
              <v-slider
                :value="year"
                :max="maxTemporalRange"
                :min="minTemporalRange"
                :thumb-size="50"
                :validate-on-blur="true"
                thumb-label="always"
                class="mt-5"
                @change="updateYear"
              >
              </v-slider>
              <v-flex shrink style="width: 6em">
                <v-text-field
                  v-model="maxTemporalRange"
                  :min="timespanMinYear"
                  :max="timespanMaxYear"
                  :validate-on-blur="true"
                  class="mt-0"
                  hide-details
                  single-line
                  type="number"
                  @change="validateMaxYear"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-flex>
      <v-flex xs12 md6>
        <div class="px-2">
          <v-card>
            <v-card-title class="pb-0">
              <h2 class="headline">
                {{ selectedDataset.title }}
              </h2>
            </v-card-title>
            <v-subheader class="subheading">
              {{ spatialCoverage }} | {{ temporalCoverage }}
            </v-subheader>
            <v-card-text class="body">
              <vue-markdown :source="selectedDataset.description" />
            </v-card-text>
            <v-card-actions>
              <TimeSeries
                v-if="isLayerSelected && selectedArea.coordinates.length > 0"
                :dataset-uri="selectedLayer.timeseriesServiceUri"
                :geometry="selectedArea"
                :variable-name="selectedLayerName"
              />
              <v-alert v-else :value="true" type="warning">
                No study area selected. Select a study area to show a time
                series
              </v-alert>
            </v-card-actions>
            <v-subheader class="title">
              Variables
            </v-subheader>
            <v-list three-line dense light>
              <v-list-tile
                v-for="(variable, index) in selectedDataset.variables"
                :key="index"
                avatar
              >
                <v-list-tile-content>
                  <v-list-tile-title class="variable">
                    <v-chip
                      small
                      color="indigo"
                      text-color="white"
                      :disabled="true"
                    >
                      <v-icon>view_column</v-icon>
                      {{ variable.class }}
                    </v-chip>
                    {{ variable.name }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title class="my-0 py-0 mx-3">
                    {{ variable.description }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
            <v-card-text>
              <div class="citation">
                <em class="font-weight-bold">
                  Source:
                </em>
                <nuxt-link
                  class="font-weight-thin"
                  :to="selectedDataset.sourceUrl"
                >
                  {{ selectedDataset.sourceUrl }}
                </nuxt-link>
              </div>
            </v-card-text>
            <v-card-text>
              <div
                v-for="(label, attr) in metadataAttributes"
                :key="attr"
                class="py-0"
              >
                <span class="font-weight-bold"> {{ label }}: </span>
                <vue-markdown>{{ selectedDataset[attr] }}</vue-markdown>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import { stringify } from 'query-string'
import { SKOPE_WMS_ENDPOINT, BaseMapEndpoints } from '~/store/constants.js'
import Component from 'nuxt-class-component'
import { namespace } from 'vuex-class'
import { clamp } from 'lodash'
import TimeSeries from '@/components/TimeSeries.vue'
import Vue from 'vue'

const fillTemplate = require('es6-dynamic-template')
const Datasets = namespace('datasets')

@Component({
  layout: 'dataset',
  components: {
    TimeSeries,
    VueMarkdown
  }
})
class DatasetDetail extends Vue {
  length = 3
  onboarding = 0
  minTemporalRange = 0
  maxTemporalRange = 2000
  selectedLayer = null
  legendControl = null
  legendImage = null
  toggleAnimation = null
  year = null
  legendPosition = 'bottomleft'
  isAnimationPlaying = false
  selectedArea = { type: 'None', coordinates: [] }

  @Datasets.State('selectedDataset')
  selectedDataset
  @Datasets.Getter('selectedDatasetTimespan')
  selectedDatasetTimespan

  get selectedLayerName() {
    return this.isLayerSelected ? this.selectedLayer.name : ''
  }

  get timespanMinYear() {
    return parseInt(this.selectedDatasetTimespan[0])
  }

  get timespanMaxYear() {
    return parseInt(this.selectedDatasetTimespan[1])
  }

  get layerType() {
    return this.selectedDataset.variables.length > 1 ? 'base' : 'overlay'
  }

  get isLayerSelected() {
    return this.selectedLayer !== null
  }

  get skopeWmsUrl() {
    return SKOPE_WMS_ENDPOINT
  }

  get defaultBaseMap() {
    return BaseMapEndpoints.default
  }

  get playIcon() {
    if (this.isAnimationPlaying) {
      return 'pause_circle_filled'
    } else {
      return 'play_circle_filled'
    }
  }

  get spatialCoverage() {
    return `${this.selectedDataset.region.name} at
     ${this.selectedDataset.region.resolution}`
  }

  get temporalCoverage() {
    const ts = this.selectedDataset.timespan
    const period = ts.period
    const timespan =
      period.gte === period.lte ? period.gte : `${period.gte}-${period.lte}`
    return `${timespan}${period.suffix} ${ts.resolutionLabel}`
  }

  get metadataAttributes() {
    return {
      originator: 'Originator',
      uncertainty: 'Uncertainty',
      methodSummary: 'Method Summary',
      references: 'References',
      contactInformation: 'Contact Information'
    }
  }

  get defaultCrs() {
    if (this.$L) {
      return this.$L.CRS.EPSG4326
    }
    return ''
  }

  get absoluteUrl() {
    return '/dataset/' + this.selectedDataset.id
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
      }, 1000)
    }
  }

  created() {
    this.$store.dispatch('datasets/loadDataset', this.$route.params.id)
    this.minTemporalRange = this.timespanMinYear
    this.maxTemporalRange = this.timespanMaxYear
  }

  mounted() {
    this.$nextTick(() => {
      const map = this.$refs.layerMap.mapObject
      const handler = event => {
        const layer = event.layer
        const isSkopeLayer = (layer.options.layers || '').startsWith('SKOPE')
        if (isSkopeLayer) {
          const variable = _.find(
            this.selectedDataset.variables,
            v => v.name === event.name
          )
          this.selectedLayer = variable
          this.updateWmsLegend(map, layer.wmsParams.layers)
        }
      }

      map.on('overlayadd', handler)
      map.on('baselayerchange', handler)
      this.addDrawToolbar(map)
    })
  }

  head() {
    return {
      title: this.selectedDataset.title
    }
  }

  nextYear() {
    if (this.selectedLayer === null) {
      return
    }
    this.updateYear(
      clamp(this.year + 1, this.minTemporalRange, this.maxTemporalRange)
    )
  }

  previousYear() {
    if (this.selectedLayer === null) {
      return
    }
    this.updateYear(
      clamp(this.year - 1, this.minTemporalRange, this.maxTemporalRange)
    )
  }

  next() {
    this.onboarding = (this.onboarding + 1) % this.length
  }

  prev() {
    this.onboarding = (this.onboarding - 1 + this.length) % this.length
  }

  setLegendImage(htmlElement) {
    this.legendImage = htmlElement
  }

  addDrawToolbar(map) {
    const L = this.$L
    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)
    const drawControlFull = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polyline: false,
        circlemarker: false,
        polygon: {
          allowIntersection: false,
          showArea: true
        }
      },
      edit: {
        featureGroup: drawnItems
      }
    })
    const drawControlEditOnly = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems
      },
      draw: false
    })
    const self = this
    map.addControl(drawControlFull)
    map.on(L.Draw.Event.EDITMOVE, event => {
      self.selectedArea = event.layer.toGeoJSON().geometry
    })
    map.on(L.Draw.Event.CREATED, event => {
      drawnItems.addLayer(event.layer)
      self.selectedArea = event.layer.toGeoJSON().geometry
      drawControlFull.remove(map)
      drawControlEditOnly.addTo(map)
    })
    map.on(L.Draw.Event.DELETED, event => {
      self.selectedArea = { type: 'None', coordinates: [] }
      if (drawnItems.getLayers().length === 0) {
        drawControlEditOnly.remove(map)
        drawControlFull.addTo(map)
      }
    })
  }

  generateWmsLegendUrl(layerName) {
    const query = {
      REQUEST: 'GetLegendGraphic',
      VERSION: '1.0.0',
      FORMAT: 'image/png',
      LAYER: layerName,
      LEGEND_OPTIONS: 'layout:vertical;dx:10'
    }
    const queryString = stringify(query)
    const legendUrl = this.skopeWmsUrl + queryString
    return legendUrl
  }

  updateWmsLegend(map, layerName) {
    const L = this.$L
    const wmsLegendUrl = this.generateWmsLegendUrl(layerName)
    if (this.legendControl === null) {
      const legend = L.control({ position: this.legendPosition })
      legend.onAdd = map => {
        const controlCss = 'leaflet-control-wms-legend'
        const legendCss = 'wms-legend'
        const div = L.DomUtil.create('div', controlCss)
        const legendImage = L.DomUtil.create('img', legendCss, div)
        legendImage.src = wmsLegendUrl
        this.setLegendImage(legendImage)
        return div
      }
      legend.addTo(map)
      this.legendControl = legend
    }
    if (this.legendImage !== null) {
      this.legendImage.src = wmsLegendUrl
    }
  }

  fillTemplateYear(templateString) {
    const year = (this.year || this.maxTemporalRange).toString()
    const layer = fillTemplate(templateString, {
      year: year.padStart(4, '0')
    })
    return layer
  }

  updateYear(year) {
    this.year = year
    this.updateWmsLayer()
  }

  updateAnimationYear() {
    if (this.year !== null && this.year < this.minTemporalRange) {
      this.updateYear(this.minTemporalRange)
    }
  }

  validateMinYear() {
    this.minTemporalRange = clamp(
      this.minTemporalRange,
      this.timespanMinYear,
      this.timespanMaxYear
    )
  }

  validateMaxYear() {
    this.maxTemporalRange = clamp(
      this.maxTemporalRange,
      this.timespanMinYear,
      this.timespanMaxYear
    )
  }

  updateWmsLayer() {
    // hairy bit of code to:
    // 1. pull out the currently selected layer's layer template string
    // 2. update it with the current year
    // 3. reset the params on the currently selected layer to request the new layer from GeoServer
    if (this.selectedLayer !== null) {
      for (const wmsLayerRef of this.$refs.wmsLayers) {
        if (wmsLayerRef.name === this.selectedLayer.name) {
          const layerTemplateString = wmsLayerRef.$vnode.data.key
          const layerName = this.fillTemplateYear(layerTemplateString)
          const wmsLayer = wmsLayerRef.mapObject
          wmsLayer.setParams({ layers: layerName }, false)
        }
      }
    }
  }

  validate({ params }) {
    return /^\w+$/.test(params.id)
  }
}
export default DatasetDetail
</script>
<style>
#map-flex {
  height: 600px;
}

@media all and (max-width: 960px) {
  #map-flex {
    height: 500px;
  }
}

@media all and (max-width: 600px) {
  #map-flex {
    height: 350px;
  }
}

.map {
  height: 100%;
  position: relative;
  z-index: 1;
}

.variable {
  height: 3em;
}
</style>
