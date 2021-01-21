<template>
  <v-responsive :aspect-ratio="16 / 9">
    <v-row class="my-5">
      <h2 class="ml-3">
        {{ selectedDataset.title }}
      </h2>
      <v-tooltip bottom
        ><template #activator="{ on, attrs }">
          <v-icon
            class="mx-2"
            v-bind="attrs"
            @click="instructions = !instructions"
            v-on="on"
            >info</v-icon
          > </template
        ><span>Instructions</span></v-tooltip
      >
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template #activator="{ on, attrs }">
          <v-btn depressed color="accent" v-bind="attrs" v-on="on"
            >View Metadata</v-btn
          >
        </template>
        <v-card>
          <v-card-title class="accent text--white">Metadata</v-card-title>
          <v-card-text class="my-3"><Metadata /></v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-spacer></v-spacer>
      <v-btn
        depressed
        color="accent"
        :disabled="!hasValidStudyArea"
        @click="goToViz($route.params.id)"
        >Next</v-btn
      >
    </v-row>
    <v-row>
      <v-col class="mx-auto">
        <v-alert
          v-model="instructions"
          outlined
          text
          border="left"
          dismissible
          type="info"
        >
          These are the dismissable instructions for this page.
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col id="map-flex" class="mx-auto">
        <v-card flat outlined class="map">
          <v-card-title class="secondary"><h3>Map</h3></v-card-title>
          <Map />
          <v-sheet inset>
            <v-toolbar class="primary" flat dense>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    color="white"
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
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    color="white"
                    v-on="on"
                    @click="selectGeoJsonFile"
                  >
                    <v-icon>fas fa-upload</v-icon>
                  </v-btn>
                </template>
                <span>Upload a GeoJSON file</span>
              </v-tooltip>
              <template v-if="selectedArea > 0">
                Selected area: {{ selectedArea }} km<sup>2</sup>
              </template>
              <v-spacer></v-spacer>
            </v-toolbar>
            <!-- end toolbar -->
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>
  </v-responsive>
</template>

<script>
import circleToPolygon from 'circle-to-polygon'
import { clamp } from 'lodash'
import { Component } from 'nuxt-property-decorator'
import { Prop } from 'vue-property-decorator'
import { stringify } from 'query-string'
import { namespace } from 'vuex-class'
import Vue from 'vue'

import {
  LEAFLET_PROVIDERS,
  SKOPE_WMS_ENDPOINT,
} from '@/store/modules/constants.js'
import Metadata from '@/components/action/Metadata.vue'
import Map from '@/components/Map.vue'

const fillTemplate = require('es6-dynamic-template')
const Datasets = namespace('datasets')

@Component({
  layout: 'BaseDataset',
  components: {
    // load time series plotly component lazily to avoid document is not defined errors
    // https://stackoverflow.com/a/50458090
    Metadata,
    Map,
  },
})
class DatasetDetail extends Vue {
  @Datasets.State('selectedDataset')
  selectedDataset
  @Datasets.Getter('selectedDatasetTimespan')
  selectedDatasetTimespan
  @Datasets.Getter('selectedDatasetTimeZero')
  selectedDatasetTimeZero

  stepNames = _.clone(this.$api().app.stepNames)

  dialog = false
  instructions = false

  // created lifecycle hook
  async created() {
    const d = this.$api().datasets
    await d.loadDataset(this.$route.params.id)
    this.minTemporalRange = this.timespanMinYear
    this.maxTemporalRange = this.timespanMaxYear
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name)
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep == 0 || this.$api().dataset.hasGeometry
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

  get selectedArea() {
    if (this.selectedAreaInSquareMeters > 0) {
      return Number.parseFloat(
        this.selectedAreaInSquareMeters / 1000000.0
      ).toFixed(2)
    }
  }

  get absoluteUrl() {
    return '/dataset/' + this.selectedDataset.id
  }

  get metadata() {
    return '/dataset/' + this.selectedDataset.id + '/metadata'
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

  goToViz(id) {
    if (_.isUndefined(id) || !this.hasValidStudyArea) {
      return
    }
    this.$router.push({ name: 'dataset-id-visualize', params: { id } })
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

.header {
  color: white;
}

ul.leaflet-draw-actions.leaflet-draw-actions-bottom li a[title='Save changes'] {
  display: none;
}

.variable {
  height: 3em;
}
</style>
