<template>
  <v-container fill-width fluid>
    <v-row>
      <h2 class="mx-5">Define Study Area</h2>
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="primary" dark v-bind="attrs" v-on="on">
            View Metadata
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline"> Metadata </v-card-title>
          <v-card-text><Metadata /></v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialog = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
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
        <template lang="md">
          {{ selectedDataset.description }}
        </template>
      </v-card-text>
      <v-subheader class="title">Variables</v-subheader>
      <v-list three-line dense light class="py-0">
        <v-list-item
          v-for="(variable, index) in selectedDataset.variables"
          :key="index"
        >
          <v-list-item-content>
            <v-list-item-title>
              <v-chip small color="info" text-color="white">
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
    </v-card>
    <v-row dense align-content-start justify-space-around wrap>
      <v-col id="map-flex" xs12 md7>
        <!-- map -->
        <div class="map px-2">
          <client-only placeholder="Loading map, please wait...">
            <l-map
              ref="layerMap"
              :min-zoom="3"
              :zoom="4"
              :center="selectedDataset.region.center"
            >
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
              <l-control-scale position="bottomright" />
            </l-map>
          </client-only>
        </div>
        <!-- end map -->
        <!-- map controls -->
        <v-sheet inset class="mx-2">
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
            <!--            <v-btn icon @click="gotoFirstYear">-->
            <!--              <v-icon>skip_previous</v-icon>-->
            <!--            </v-btn>-->
            <!--            <v-btn icon @click="previousYear">-->
            <!--              <v-icon>arrow_left</v-icon>-->
            <!--            </v-btn>-->
            <!--            <v-btn-toggle icon background-color="indigo">-->
            <!--              <v-btn text @click="togglePlay">-->
            <!--                <v-icon>{{ playIcon }}</v-icon>-->
            <!--              </v-btn>-->
            <!--            </v-btn-toggle>-->
            <!--            <v-btn icon @click="nextYear">-->
            <!--              <v-icon>arrow_right</v-icon>-->
            <!--            </v-btn>-->
            <!--            <v-btn icon @click="gotoLastYear">-->
            <!--              <v-icon>skip_next</v-icon>-->
            <!--            </v-btn>-->
          </v-toolbar>
          <!-- end toolbar -->
          <!-- filter sliders -->
          <v-container height="100%">
            <v-row dense>
              <!-- palmer modified drought index opacity -->
              <v-col cols="6">
                <v-slider
                  v-model="opacity"
                  dense
                  hint="Palmer Modified Drought Index Opacity"
                  persistent-hint
                  min="0"
                  max="100"
                  step="1"
                  thumb-label="always"
                  :thumb-size="24"
                />
              </v-col>
              <!-- temporal range -->
              <v-col cols="6">
                <v-slider
                  dense
                  :value="year"
                  :max="maxTemporalRange"
                  :min="minTemporalRange"
                  :thumb-size="32"
                  hint="Temporal Range"
                  persistent-hint
                  thumb-label="always"
                  @change="updateYear"
                >
                  <template v-slot:prepend>
                    <v-text-field
                      v-model="minTemporalRange"
                      class="pt-0 mt-0"
                      :min="timespanMinYear"
                      :max="timespanMaxYear"
                      hint="Start Year"
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
          </v-container>
          <!-- end filter sliders -->
        </v-sheet>
        <!-- end map controls -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import circleToPolygon from 'circle-to-polygon'
import { clamp } from 'lodash'
import { Component } from 'nuxt-property-decorator'
import { stringify } from 'query-string'
import { namespace } from 'vuex-class'
import Vue from 'vue'

import {
  LEAFLET_PROVIDERS,
  SKOPE_WMS_ENDPOINT,
} from '@/store/modules/constants.js'
import { DataSets } from '@/store/modules/datasets'
import Metadata from '@/components/action/Metadata.vue'

const fillTemplate = require('es6-dynamic-template')
const Datasets = namespace('datasets')

@Component({
  layout: 'BaseDataset',
  components: {
    // load time series plotly component lazily to avoid document is not defined errors
    // https://stackoverflow.com/a/50458090
    'time-series': () => import('@/components/TimeSeries.vue'),
    Metadata,
  },
})
class DatasetDetail extends Vue {
  minTemporalRange = 0
  maxTemporalRange = new Date().getFullYear()
  selectedLayer = null
  legendControl = null
  legendImage = null
  toggleAnimation = null
  year = 1
  defaultRegionOpacity = 0.05
  opacity = 30
  legendPosition = 'bottomleft'
  isAnimationPlaying = false
  showDetails = false
  animationSpeed = 2000
  defaultCircleToPolygonEdges = 32
  selectedGeometry = { type: 'None', coordinates: [] }
  selectedAreaInSquareMeters = 0.0
  wGeometryKey = 'skope:geometry'
  wMinTemporalRangeKey = 'skope:temporal-range-min'
  wMaxTemporalRangeKey = 'skope:temporal-range-max'

  @Datasets.State('selectedDataset')
  selectedDataset
  @Datasets.Getter('selectedDatasetTimespan')
  selectedDatasetTimespan
  @Datasets.Getter('selectedDatasetTimeZero')
  selectedDatasetTimeZero

  dialog = false

  async created() {
    const d = this.$api().datasets
    await d.loadDataset(this.$route.params.id)
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
        this.$api().datasets.selectVariable(defaultVariable.id)
        this.selectedLayer = defaultVariable
      }
      map.on('overlayadd', handler)
      map.on('baselayerchange', handler)
      this.addDrawToolbar(map)
    })
  }

  get selectedArea() {
    if (this.selectedAreaInSquareMeters > 0) {
      return Number.parseFloat(
        this.selectedAreaInSquareMeters / 1000000.0
      ).toFixed(2)
    }
  }

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

  get metadata() {
    return '/dataset/' + this.selectedDataset.id + '/metadata'
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

  setLegendImage(htmlElement) {
    this.legendImage = htmlElement
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

  updateSelectedGeometry(layer) {
    const data = layer.toGeoJSON()
    // store geoJSON in local storage
    if (layer instanceof L.Circle) {
      data.properties.radius = layer.getRadius()
    }
    this.saveSelectedGeometry(data)
    if (layer instanceof L.Circle) {
      const geometry = circleToPolygon(
        data.geometry.coordinates,
        layer.getRadius(),
        this.defaultCircleToPolygonEdges
      )
      data.geometry = geometry
      this.selectedAreaInSquareMeters = layer.getRadius() * Math.PI * Math.PI
    } else if (layer instanceof L.Marker) {
      this.selectedAreaInSquareMeters = 0
    } else {
      this.selectedAreaInSquareMeters = L.GeometryUtil.geodesicArea(
        layer.getLatLngs()[0]
      )
    }
    this.selectedGeometry = data.geometry
  }

  clearSelectedGeometry() {
    this.selectedGeometry = { type: 'None', coordinates: [] }
    this.selectedAreaInSquareMeters = 0.0
    this.$warehouse.remove(this.wGeometryKey)
  }

  saveSelectedGeometry(geoJson) {
    this.$warehouse.set(this.wGeometryKey, JSON.stringify(geoJson))
  }

  saveTemporalRange() {
    this.$warehouse.set(this.wMinTemporalRangeKey, this.minTemporalRange)
    this.$warehouse.set(this.wMaxTemporalRangeKey, this.maxTemporalRange)
  }

  getSavedTemporalRange() {
    const minTemporalRange = this.$warehouse.get(
      this.wMinTemporalRangeKey,
      this.minTemporalRange
    )
    const maxTemporalRange = this.$warehouse.get(
      this.wMaxTemporalRangeKey,
      this.maxTemporalRange
    )
    if (minTemporalRange || maxTemporalRange) {
      return [minTemporalRange, maxTemporalRange]
    }
    return []
  }

  checkAndRestoreSavedTemporalRange() {
    const savedTemporalRange = this.getSavedTemporalRange()
    if (savedTemporalRange) {
      this.minTemporalRange = savedTemporalRange[0]
      this.maxTemporalRange = savedTemporalRange[1]
      this.updateYear(
        clamp(this.minTemporalRange, this.year, this.maxTemporalRange)
      )
    }
  }

  checkAndRestoreSavedGeometry(map) {
    const savedGeometry = this.getSavedGeometry()
    if (savedGeometry) {
      this.restoreSelectedGeometry(savedGeometry, map)
    }
  }

  restoreSelectedGeometry(savedGeometry, map) {
    const L = this.$L
    if (!map) {
      map = this.$refs.layerMap.mapObject
    }
    const geoJsonLayer = L.geoJson(savedGeometry, {
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
      this.updateSelectedGeometry(l)
    })
    this.enableEditOnly(map)
    let padding = [5, 5]
    console.log(geoJsonLayer)
    if (geoJsonLayer instanceof L.Marker) {
      console.log('Setting padding for marker')
      padding = [30, 30]
    }
    map.fitBounds(this.drawnItems.getBounds(), { padding })
  }

  getSavedGeometry() {
    const skopeGeometry = this.$warehouse.get(this.wGeometryKey)
    if (skopeGeometry) {
      return JSON.parse(skopeGeometry)
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
    // check for persisted geometry
    this.checkAndRestoreSavedGeometry(map)
    // check for persisted temporal range
    this.checkAndRestoreSavedTemporalRange()
    map.on(L.Draw.Event.EDITRESIZE, (e) => self.updateSelectedGeometry(e.layer))
    map.on(L.Draw.Event.EDITMOVE, (e) => self.updateSelectedGeometry(e.layer))
    map.on(L.Draw.Event.EDITVERTEX, (e) => self.updateSelectedGeometry(e.poly))
    map.on(L.Draw.Event.CREATED, (event) => {
      const layer = event.layer
      self.updateSelectedGeometry(layer)
      self.drawnItems.addLayer(layer)
      self.enableEditOnly(map)
    })
    map.on(L.Draw.Event.DELETED, (event) => {
      self.clearSelectedGeometry()
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
    this.saveTemporalRange()
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
    this.saveTemporalRange()
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

.map {
  height: 100%;
  position: relative;
  z-index: 1;
}

ul.leaflet-draw-actions.leaflet-draw-actions-bottom li a[title='Save changes'] {
  display: none;
}
</style>
