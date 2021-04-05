<template>
  <v-row class="fill-height">
    <client-only placeholder="Loading map, please wait...">
      <l-map
        ref="layerMap"
        :min-zoom="3"
        :zoom="4"
        :center="metadata.region.center"
        @ready="mapReady"
      >
        <l-control-attribution v-if="showMapControls" position="topright" />
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
          :bounds="metadata.region.extents"
          :style="metadata.region.style"
          :fill-opacity="defaultRegionOpacity"
        />
        <l-control-layers
          v-if="showMapControls"
          :sort-layers="false"
          position="topright"
        />
        <l-wms-tile-layer
          v-for="v of metadata.variables"
          ref="wmsLayers"
          :key="v.id"
          :base-url="skopeWmsUrl"
          :layers="fillTemplateYear(v.wmsLayer)"
          :name="v.name"
          :crs="defaultCrs"
          :transparent="true"
          :opacity="layerOpacity"
          layer-type="overlay"
          :attribution="v.name"
          :visible="v.visible"
          version="1.3.0"
          format="image/png"
        />
        <l-control-scale position="bottomright" />
      </l-map>
    </client-only>
  </v-row>
</template>

<script>
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import { Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import {
  LEAFLET_PROVIDERS,
  SKOPE_WMS_ENDPOINT,
} from '@/store/modules/constants'
import circleToPolygon from 'circle-to-polygon'
import { stringify } from 'query-string'

const App = namespace('app')
const Dataset = namespace('dataset')
const fillTemplate = require('es6-dynamic-template')
import _ from 'lodash'

@Component({
  components: {},
})
class Map extends Vue {
  @Prop({ default: 2000 })
  year

  @Prop({ default: 0.5 })
  opacity

  maxTemporalRange = new Date().getFullYear()

  defaultRegionOpacity = 0.05
  defaultCircleToPolygonEdges = 32
  legendImage = null
  legendControl = null
  legendPosition = 'bottomleft'
  wGeometryKey = 'skope:geometry'
  wMinTemporalRangeKey = 'skope:temporal-range-min'
  wMaxTemporalRangeKey = 'skope:temporal-range-max'

  get stepNames() {
    return this.$api().app.stepNames
  }

  get metadata() {
    return this.$api().dataset.metadata
  }

  get timespan() {
    return this.$api().dataset.timespan
  }

  get timeZero() {
    return this.$api().dataset.timeZero
  }

  get variable() {
    return this.$api().dataset.variable
  }

  get geometry() {
    return this.$api().dataset.geometry
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name)
  }

  get showMapControls() {
    return this.currentStep >= 2
  }

  get selectedLayerName() {
    return this.isLayerSelected ? this.variable.name : ''
  }

  get opacityLabel() {
    return `${this.selectedLayerName} Opacity`
  }

  get layerOpacity() {
    return this.opacity / 100.0
  }

  get isLayerSelected() {
    return this.variable !== null
  }

  get skopeWmsUrl() {
    return SKOPE_WMS_ENDPOINT
  }

  get leafletProviders() {
    return LEAFLET_PROVIDERS
  }

  get defaultCrs() {
    if (this.$L) {
      return this.$L.CRS.EPSG4326
    }
    return ''
  }

  set variable(id) {
    this.$api().dataset.setVariable(id)
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
      draw: true,
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
    map.on(L.Draw.Event.EDITRESIZE, (event) =>
      self.updateSelectedGeometry(event.layer)
    )
    map.on(L.Draw.Event.EDITMOVE, (event) =>
      self.updateSelectedGeometry(event.layer)
    )
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

  checkAndRestoreSavedGeometry(map) {
    const savedGeometry = this.getSavedGeometry()
    if (savedGeometry) {
      this.restoreSelectedGeometry(savedGeometry, map)
    }
  }

  clearSelectedGeometry() {
    this.$api().dataset.clearGeometry()
  }

  disableEditOnly(map) {
    this.drawControlEditOnly.remove(map)
    this.drawControlFull.addTo(map)
  }

  enableEditOnly(map) {
    this.drawControlFull.remove(map)
    this.drawControlEditOnly.addTo(map)
  }

  setLegendImage(htmlElement) {
    this.legendImage = htmlElement
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
    console.log({ geoJsonLayer })
    if (geoJsonLayer instanceof L.Marker) {
      console.log('Setting padding for marker')
      padding = [30, 30]
    }
    map.fitBounds(this.drawnItems.getBounds(), { padding })
  }

  saveSelectedGeometry(geoJson) {
    this.$warehouse.set(this.wGeometryKey, JSON.stringify(geoJson))
  }

  updateSelectedGeometry(layer) {
    const data = layer.toGeoJSON()
    // store geoJSON in local storage
    if (layer instanceof L.Circle) {
      data.properties.radius = layer.getRadius()
    }
    this.saveSelectedGeometry(data)
    let area = 0
    if (layer instanceof L.Circle) {
      const geometry = circleToPolygon(
        data.geometry.coordinates,
        layer.getRadius(),
        this.defaultCircleToPolygonEdges
      )
      data.geometry = geometry
      area = layer.getRadius() * Math.PI * Math.PI
    } else if (layer instanceof L.Marker) {
      area = 0
    } else {
      area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0])
    }
    this.$api().dataset.setGeometry({
      geometry: data.geometry,
      area,
    })
  }

  @Watch('year')
  updateWmsLayer() {
    // hairy bit of code to:
    // 1. pull out the currently selected layer's layer template string
    // 2. update it with the current year
    // 3. reset the params on the currently selected layer to request the new layer from GeoServer
    if (this.variable !== null) {
      for (const wmsLayerRef of this.$refs.wmsLayers) {
        if (wmsLayerRef.name === this.variable.name) {
          const layerName = this.fillTemplateYear(this.variable.wmsLayer)
          const wmsLayer = wmsLayerRef.mapObject
          wmsLayer.setParams({ layers: layerName }, false)
        }
      }
    }
  }

  updateWmsLegend(map, layerName) {
    const L = this.$L
    const wmsLegendUrl = this.generateWmsLegendUrl(layerName)
    if (_.isNil(this.legendControl)) {
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

  getSavedGeometry() {
    const skopeGeometry = this.$warehouse.get(this.wGeometryKey)
    if (skopeGeometry) {
      return JSON.parse(skopeGeometry)
    }
    return false
  }

  fillTemplateYear(templateString) {
    const year = (this.year || this.maxTemporalRange).toString()
    const layer = fillTemplate(templateString, {
      year: year.padStart(4, '0'),
    })
    return layer
  }

  isSkopeLayer(leafletLayer) {
    return (leafletLayer.options.layers || '').startsWith('SKOPE')
  }

  mapReady(map) {
    const handler = (event) => {
      console.log('handling layer change event ', { event })
      const leafletLayer = event.layer
      if (this.isSkopeLayer(leafletLayer)) {
        const variable = _.find(
          this.metadata.variables,
          (v) => v.name === event.name
        )
        this.$api().dataset.setVariable(variable.id)
        this.updateWmsLegend(map, leafletLayer.wmsParams.layers)
        leafletLayer.bringToFront()
      }
    }
    map.on('overlayadd', handler)
    map.on('baselayerchange', handler)
    this.addDrawToolbar(map)
  }

  @Watch('geometry')
  clearGeometry(geometry) {
    if (geometry.type === 'None') {
      console.log('clear selected geometry')
      const L = this.$L
      this.drawnItems.clearLayers()
      this.$warehouse.remove(this.wGeometryKey)
    }
  }
}
export default Map
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

.map {
  height: calc(100% - 48px);
  position: relative;
  z-index: 1;
}

ul.leaflet-draw-actions.leaflet-draw-actions-bottom li a[title='Save changes'] {
  display: none;
}
</style>
