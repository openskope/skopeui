<template>
  <v-container fill-width fluid>
    <v-row dense align-content-start justify-space-around wrap>
      <v-col id="map-flex" xs12 md7>
        <div class="map px-2">
          <client-only placeholder="Loading map, please wait...">
            <l-map
              ref="layerMap"
              :zoom="selectedDataset.region.zoom"
              :center="selectedDataset.region.center"
              :draw-control="true"
              style="z-index: 2"
            >
              <l-control-scale position="bottomright" />
              <l-control-attribution position="topright" />
              <l-control-layers :sort-layers="false" position="topright" />
              <l-tile-layer
                v-for="provider of leafletProviders"
                :key="provider.name"
                :url="provider.url"
                :name="provider.name"
                :attribution="provider.attribution"
                :visible="provider.default"
                :min-zoom="provider.minZoom"
                :max-zoom="provider.maxZoom"
                layer-type="base"
              />
              <l-rectangle
                :bounds="selectedDataset.region.extents"
                :style="selectedDataset.region.style"
                :fill-opacity="defaultRegionOpacity"
              />
              <l-control-layers :sort-layers="false" position="topright" />
              <l-wms-tile-layer
                v-for="variable of selectedDataset.variables"
                ref="wmsLayers"
                :key="variable.wmsLayer"
                :base-url="skopeWmsUrl"
                :layers="fillTemplateYear(variable.wmsLayer)"
                :name="variable.name"
                :crs="defaultCrs"
                :transparent="true"
                :opacity="layerOpacity"
                layer-type="base"
                :attribution="variable.name"
                :visible="variable.visible"
                version="1.3.0"
                format="image/png"
              />
            </l-map>
          </client-only>
        </div>
        <v-sheet inset height="100%" class="mx-2">
          <v-toolbar color="indigo" dark>
            <v-btn icon @click="exportSelectedArea">
              <a id="exportSelectedArea">
                <v-icon>fas fa-download</v-icon>
              </a>
            </v-btn>
            <input
              id="loadGeoJsonFile"
              type="file"
              style="display: none"
              @change="loadGeoJson"
            />
            <v-btn icon @click="selectGeoJsonFile">
              <v-icon>fas fa-upload</v-icon>
            </v-btn>
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
          <v-container height="100%">
            <v-row dense>
              <v-col>
                <v-slider
                  dense
                  :value="year"
                  :max="maxTemporalRange"
                  :min="minTemporalRange"
                  :thumb-size="36"
                  hint="Temporal Range (Start Year | Current Year | End Year)"
                  persistent-hint
                  thumb-label="always"
                  class="px-3 pt-2"
                  @change="updateYear"
                >
                  <template v-slot:prepend>
                    <v-text-field
                      v-model="minTemporalRange"
                      class="pt-0 mt-0"
                      :min="timespanMinYear"
                      :max="timespanMaxYear"
                      hint="Start Year"
                      label="Start Year"
                      hide-details
                      single-line
                      type="number"
                      style="width: 60px"
                      @input="validateMinYear"
                    ></v-text-field>
                  </template>
                  <template v-slot:append>
                    <v-text-field
                      v-model="maxTemporalRange"
                      :min="timespanMinYear"
                      :max="timespanMaxYear"
                      class="pt-0 mt-0"
                      hint="End Year"
                      hide-details
                      single-line
                      type="number"
                      style="width: 60px"
                      @input="validateMaxYear"
                    ></v-text-field>
                  </template>
                </v-slider>
              </v-col>
            </v-row>
            <v-row dense>
              <v-col>
                <v-slider
                  v-model="opacity"
                  dense
                  :label="opacityLabel"
                  min="0"
                  max="100"
                  step="1"
                >
                </v-slider>
              </v-col>
            </v-row>
          </v-container>
        </v-sheet>
      </v-col>
      <v-col xs12 md5>
        <div class="px-2">
          <v-card>
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-header disable-icon-rotate>
                  <h3 class="blue--text">Time Series (click for more info)</h3>
                  <template v-slot:actions>
                    <v-icon color="primary">info</v-icon>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-alert border="left" color="blue lighten-3" prominent>
                    Please select a
                    <b>study area</b> and <b>variable of interest</b> to display
                    a time series for the given date range. You can
                    <b>select a study area</b>
                    with the toolbar on the left side of the map and
                    <b>select a variable</b> using the layer controls
                    <v-icon>fas fa-layer-group</v-icon> at the top and bottom
                    right corners of the map.
                  </v-alert>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <v-card-title class="pb-0">
              <h2 class="headline">
                {{ selectedDataset.title }}
              </h2>
            </v-card-title>
            <v-subheader class="subheading">
              {{ spatialCoverage }} | {{ temporalCoverage }}
            </v-subheader>
            <v-card-text class="body">
              <template lang="md">
                {{ selectedDataset.description }}
              </template>
            </v-card-text>
            <v-card-actions
              v-if="isLayerSelected && selectedArea.coordinates.length > 0"
            >
              <time-series
                :dataset-uri="selectedLayer.timeseriesServiceUri"
                :time-zero="selectedDatasetTimeZero"
                :geometry="selectedArea"
                :variable-name="selectedLayerName"
                :min-year="minTemporalRange"
                :max-year="maxTemporalRange"
              />
            </v-card-actions>
            <v-subheader class="title">Variables</v-subheader>
            <v-list three-line dense light class="py-0">
              <v-list-item
                v-for="(variable, index) in selectedDataset.variables"
                :key="index"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    <v-chip label small color="indigo" text-color="white">
                      <v-icon>view_column</v-icon>
                      {{ variable.class }}
                    </v-chip>
                    {{ variable.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="my-0 py-0 mx-3">
                    {{ variable.description }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-card-text class="pt-0">
              <div class="citation font-weight-bold">
                <em> Source: </em>
                <a target="_blank" :href="selectedDataset.sourceUrl">
                  {{ selectedDataset.sourceUrl }}
                  <v-icon color="teal" x-small>fas fa-external-link-alt</v-icon>
                </a>
              </div>
            </v-card-text>
            <v-card-text height="100%" class="pt-0 mx-0">
              <v-expansion-panels flat focusable>
                <v-expansion-panel class="elevation-0">
                  <v-expansion-panel-header class="title px-0 mx-0">
                    Detailed Metadata
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div
                      v-for="(label, attr) in metadataAttributes"
                      :key="attr"
                      class="py-0"
                    >
                      <span class="font-weight-bold"> {{ label }}: </span>
                      <div v-html="$md.render(selectedDataset[attr])"></div>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import circleToPolygon from 'circle-to-polygon'
import { clamp } from 'lodash'
import { Component } from 'nuxt-property-decorator'
import { stringify } from 'query-string'
import Vue from 'vue'
import { namespace } from 'vuex-class'

import {
  LEAFLET_PROVIDERS,
  SKOPE_WMS_ENDPOINT,
  BaseMapProvider,
} from '@/store/constants.js'

const fillTemplate = require('es6-dynamic-template')
const Datasets = namespace('datasets')

@Component({
  layout: 'dataset',
  components: {
    // load time series plotly component lazily to avoid document is not defined errors
    // https://stackoverflow.com/a/50458090
    'time-series': () => import('@/components/TimeSeries.vue'),
  },
})
class DatasetDetail extends Vue {
  length = 3
  onboarding = 0
  minTemporalRange = 0
  maxTemporalRange = new Date().getFullYear()
  selectedLayer = null
  legendControl = null
  legendImage = null
  toggleAnimation = null
  year = null
  defaultRegionOpacity = 0.05
  opacity = 30
  legendPosition = 'bottomleft'
  isAnimationPlaying = false
  showDetails = false
  animationSpeed = 2000
  defaultCircleToPolygonEdges = 32
  selectedArea = { type: 'None', coordinates: [] }

  @Datasets.State('selectedDataset')
  selectedDataset
  @Datasets.Getter('selectedDatasetTimespan')
  selectedDatasetTimespan
  @Datasets.Getter('selectedDatasetTimeZero')
  selectedDatasetTimeZero

  get selectedLayerName() {
    return this.isLayerSelected ? this.selectedLayer.name : ''
  }

  get opacityLabel() {
    return `${this.selectedLayerName} Opacity`
  }

  get layerOpacity() {
    return this.opacity / 100.0
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

  get leafletProviders() {
    return LEAFLET_PROVIDERS
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
      contactInformation: 'Contact Information',
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
      }, this.animationSpeed)
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
      const handler = (event) => {
        const layer = event.layer
        const isSkopeLayer = (layer.options.layers || '').startsWith('SKOPE')
        if (isSkopeLayer) {
          const variable = _.find(
            this.selectedDataset.variables,
            (v) => v.name === event.name
          )
          this.selectedLayer = variable
          this.updateWmsLegend(map, layer.wmsParams.layers)
          layer.bringToFront()
        }
      }
      if (this.selectedDataset.variables.length === 1) {
        let defaultVariable = this.selectedDataset.variables[0]
        this.$store.dispatch('datasets/selectVariable', defaultVariable.id)
        this.selectedLayer = defaultVariable
      }
      map.on('overlayadd', handler)
      map.on('baselayerchange', handler)
      this.addDrawToolbar(map)
    })
  }

  head() {
    return {
      title: this.selectedDataset.title,
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

  gotoFirstYear() {
    if (this.selectedLayer === null) {
      return
    }
    this.updateYear(this.minTemporalRange)
  }

  gotoLastYear() {
    if (this.selectedLayer === null) {
      return
    }
    this.updateYear(this.maxTemporalRange)
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

  loadGeoJson(event) {
    const file = event.target.files[0]
    file.text().then((text) => {
      console.log('received possible geojson to load')
      console.log(text)
      try {
        let area = JSON.parse(text)
        this.restoreSelectedArea(area)
      } catch (error) {
        console.error(error)
        alert("Sorry! We couldn't re-import this file: " + text)
      }
    })
  }

  selectGeoJsonFile() {
    document.getElementById('loadGeoJsonFile').click()
  }

  exportSelectedArea(event) {
    const selectedArea = this.getSelectedArea()
    if (selectedArea) {
      const convertedArea =
        'text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(selectedArea))
      const button = document.getElementById('exportSelectedArea')
      button.setAttribute('href', 'data:' + convertedArea)
      button.setAttribute('download', 'skope-area.geojson')
    }
  }

  updateSelectedArea(layer) {
    const data = layer.toGeoJSON()
    // store geoJSON in local storage
    if (layer instanceof L.Circle) {
      data.properties.radius = layer.getRadius()
    }
    this.saveSelectedArea(data)
    if (layer instanceof L.Circle) {
      const geometry = circleToPolygon(
        data.geometry.coordinates,
        layer.getRadius(),
        this.defaultCircleToPolygonEdges
      )
      console.log('converting circle to polygon: ')
      console.log(geometry)
      data.geometry = geometry
    }
    this.selectedArea = data.geometry
  }

  clearSelectedArea() {
    this.selectedArea = { type: 'None', coordinates: [] }
    this.$warehouse.remove('skope.area')
  }

  saveSelectedArea(geoJson) {
    this.$warehouse.set('skope.area', JSON.stringify(geoJson))
  }

  restoreSelectedArea(savedArea, map) {
    if (!map) {
      map = this.$refs.layerMap.mapObject
    }
    const geoJsonLayer = L.geoJson(savedArea, {
      pointToLayer: (feature, latlng) => {
        if (feature.properties.radius) {
          return new L.Circle(latlng, feature.properties.radius)
        } else {
          return new L.Marker(latlng)
        }
      },
    })
    // remove all existing layers from the FeatureGroup
    this.drawnItems.clearLayers()
    geoJsonLayer.eachLayer((l) => {
      this.drawnItems.addLayer(l)
      this.updateSelectedArea(l)
    })
    this.enableEditOnly(map)
    map.fitBounds(this.drawnItems.getBounds(), { padding: [5, 5] })
  }

  getSelectedArea() {
    const skopeArea = this.$warehouse.get('skope.area')
    if (skopeArea) {
      return JSON.parse(skopeArea)
    }
    return false
  }

  disableEditOnly(map) {
    this.drawControlEditOnly.remove(map)
    this.drawControlFull.addTo(map)
  }

  enableEditOnly(map) {
    this.drawControlFull.remove(map)
    this.drawControlEditOnly.addTo(map)
  }

  addDrawToolbar(map) {
    const L = this.$L
    this.drawnItems = new L.FeatureGroup()
    map.addLayer(this.drawnItems)
    this.drawControlFull = new L.Control.Draw({
      position: 'topleft',
      draw: {
        // disable polylines and circlemarkers, allow polygon, rectangle, circle, and marker
        polyline: false,
        circlemarker: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
      },
      edit: {
        featureGroup: this.drawnItems,
      },
    })
    this.drawControlEditOnly = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems,
      },
      draw: false,
    })
    // set custom tooltips on the draw and edit toolbars
    const drawControlButtons = L.drawLocal.draw.toolbar.buttons
    drawControlButtons.marker = 'Select a point'
    drawControlButtons.polygon = 'Select a polygon area'
    drawControlButtons.circle = 'Select a circular area'
    drawControlButtons.rectangle = 'Select a rectangular area'
    const editControlButtons = L.drawLocal.edit.toolbar.buttons
    editControlButtons.edit = 'Edit spatial selection'
    editControlButtons.editDisabled = 'No spatial selection to edit'
    editControlButtons.remove = 'Clear spatial selection'
    editControlButtons.removeDisabled = 'No spatial selection to remove'
    const self = this
    map.addControl(this.drawControlFull)
    // check for a persisted area
    const savedArea = this.getSelectedArea()
    if (savedArea) {
      this.restoreSelectedArea(savedArea, map)
    }
    map.on(L.Draw.Event.EDITMOVE, (e) => self.updateSelectedArea(e.layer))
    map.on(L.Draw.Event.EDITVERTEX, (e) => self.updateSelectedArea(e.poly))
    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer
      self.updateSelectedArea(layer)
      self.drawnItems.addLayer(layer)
      self.enableEditOnly(map)
    })
    map.on(L.Draw.Event.DELETED, (event) => {
      self.clearSelectedArea()
      if (self.drawnItems.getLayers().length === 0) {
        self.disableEditOnly(map)
      }
    })
  }

  generateWmsLegendUrl(layerName) {
    const query = {
      REQUEST: 'GetLegendGraphic',
      VERSION: '1.0.0',
      FORMAT: 'image/png',
      LAYER: layerName,
      LEGEND_OPTIONS: 'layout:vertical;dx:10',
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
      legend.onAdd = (map) => {
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
      year: year.padStart(4, '0'),
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
    this.updateYear(
      clamp(this.minTemporalRange, this.year, this.maxTemporalRange)
    )
  }

  validateMaxYear() {
    this.maxTemporalRange = clamp(
      this.maxTemporalRange,
      this.timespanMinYear,
      this.timespanMaxYear
    )
    this.updateYear(
      clamp(this.minTemporalRange, this.year, this.maxTemporalRange)
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
.leaflet-top.leaflet-right
  .leaflet-control-layers:nth-child(2)
  .leaflet-control-layers-toggle {
  background-image: url(/earth.svg);
}

#exportSelectedArea {
  text-decoration: none;
  color: inherit;
}

#map-flex {
  height: 500px;
  margin-bottom: 2rem;
}

@media all and (max-width: 960px) {
  #map-flex {
    height: 400px;
  }
}

@media all and (max-width: 600px) {
  #map-flex {
    height: 250px;
  }
}

.map {
  height: 100%;
  position: relative;
  z-index: 1;
}

ul.leaflet-draw-actions.leaflet-draw-actions-bottom li a[title='Save changes'] {
  display: none;
}
</style>
