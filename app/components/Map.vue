<template>
  <div class="fill-height">
    <client-only placeholder="Loading map, please wait...">
      <l-map
        ref="layerMap"
        :min-zoom="3"
        :zoom="4"
        :center="selectedDataset.region.center"
        @ready="mapReady"
      >
        <l-control-attribution v-if="showMapControls" position="topright" />
        <l-control-layers
          v-if="showMapControls"
          :sort-layers="false"
          position="topright"
        />
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
        <l-control-layers
          v-if="showMapControls"
          :sort-layers="false"
          position="topright"
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
const Dataset = namespace('dataset')
const Datasets = namespace('datasets')
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

  @Prop({ default: false })
  clear

  maxTemporalRange = new Date().getFullYear()

  defaultRegionOpacity = 0.05
  defaultCircleToPolygonEdges = 32
  legendImage = null
  legendControl = null
  legendPosition = 'bottomleft'
  selectedAreaInSquareMeters = 0.0
  wGeometryKey = 'skope:geometry'
  wMinTemporalRangeKey = 'skope:temporal-range-min'
  wMaxTemporalRangeKey = 'skope:temporal-range-max'
  stepNames = _.clone(this.$api().app.stepNames)

  @Datasets.State('selectedDataset')
  selectedDataset
  @Datasets.Getter('selectedDatasetTimespan')
  selectedDatasetTimespan
  @Datasets.Getter('selectedDatasetTimeZero')
  selectedDatasetTimeZero
  @Dataset.State('layer')
  selectedLayer
  @Dataset.State('geometry')
  selectedGeometry

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

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name)
  }

  get showMapControls() {
    return this.currentStep >= 2
  }

  checkAndRestoreSavedGeometry(map) {
    const savedGeometry = this.getSavedGeometry()
    if (savedGeometry) {
      this.restoreSelectedGeometry(savedGeometry, map)
    }
  }

  clearSelectedGeometry() {
    this.$api().dataset.clearGeometry()
    this.selectedAreaInSquareMeters = 0.0
    this.$warehouse.remove(this.wGeometryKey)
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
    console.log(geoJsonLayer)
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
    this.$api().dataset.setGeometry(data.geometry)
  }

  @Watch('year')
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

  get defaultCrs() {
    if (this.$L) {
      return this.$L.CRS.EPSG4326
    }
    return ''
  }

  getSavedGeometry() {
    const skopeGeometry = this.$warehouse.get(this.wGeometryKey)
    if (skopeGeometry) {
      return JSON.parse(skopeGeometry)
    }
    return false
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

  fillTemplateYear(templateString) {
    const year = (this.year || this.maxTemporalRange).toString()
    const layer = fillTemplate(templateString, {
      year: year.padStart(4, '0'),
    })
    return layer
  }

  mapReady(m) {
    const map = this.$refs.layerMap.mapObject
    const handler = (event) => {
      const layer = event.layer
      const isSkopeLayer = (layer.options.layers || '').startsWith('SKOPE')
      if (isSkopeLayer) {
        const variable = _.find(
          this.selectedDataset.variables,
          (v) => v.name === event.name
        )
        this.$api().datasets.selectVariable(variable.id)
        this.$api().dataset.setLayer(variable)
        this.updateWmsLegend(map, layer.wmsParams.layers)
        layer.bringToFront()
      }
    }
    if (this.selectedDataset.variables.length === 1) {
      let defaultVariable = this.selectedDataset.variables[0]
      this.$api().datasets.selectVariable(defaultVariable.id)
      this.$api().dataset.setLayer(defaultVariable)
    }
    map.on('overlayadd', handler)
    map.on('baselayerchange', handler)
    this.addDrawToolbar(map)
  }

  @Watch('clear')
  clearGeometry() {
    console.log('clear selected geometry')
    const L = this.$L
    this.drawnItems.clearLayers()
    this.drawnItems = new L.FeatureGroup()
    this.clearSelectedGeometry()
    const map = this.$refs.layerMap.mapObject
    this.addDrawToolbar(map)
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
