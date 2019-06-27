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
              <l-wms-tile-layer
                v-for="variable of selectedDataset.variables"
                ref="wmsLayers"
                :key="variable.wmsLayer"
                :base-url="skopeWmsUrl"
                :layers="fillTemplateYear(variable.wmsLayer)"
                :name="variable.name"
                :crs="defaultCrs"
                :transparent="true"
                :visible="false"
                :opacity="0.5"
                :layer-type="layerType"
                version="1.3.0"
                format="image/png"
              />
            </l-map>
          </no-ssr>
        </div>
        <v-form>
          <v-container py-0>
            <v-layout align-center justify-space-between row>
              <v-subheader class="pa-0">
                Date range (year)
              </v-subheader>
              <div>
                <v-icon>play_circle_filled</v-icon>
                <v-icon>pause</v-icon>
                <v-icon>stop</v-icon>
              </div>
            </v-layout>
            <v-slider
              :value="year"
              :max="maxYear"
              :min="minYear"
              :thumb-size="30"
              thumb-label
              class="mt-0"
              @change="updateYear"
            >
              <template v-slot:prepend>
                {{ minYear }}
              </template>
              <template v-slot:append>
                {{ maxYear }}
              </template>
            </v-slider>
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
            <v-subheader class="title">
              Variables
            </v-subheader>
            <v-list dense light>
              <v-list-tile
                v-for="(variable, index) in selectedDataset.variables"
                :key="index"
                avatar
              >
                <v-list-tile-content>
                  <v-list-tile-title class="variable">
                    <v-chip small color="secondary">
                      {{ variable.class }}
                    </v-chip>
                    {{ variable.name }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
            <v-card-text>
              <div class="py-3 citation">
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
                class="py-1"
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
import Vue from 'vue'

const fillTemplate = require('es6-dynamic-template')
const Datasets = namespace('datasets')

@Component({
  layout: 'dataset',
  components: {
    VueMarkdown
  }
})
class DatasetDetail extends Vue {
  length = 3
  onboarding = 0
  temporalRange = []
  selectedLayer = null
  legendControl = null
  legendImage = null
  legendPosition = 'bottomleft'
  year = null

  @Datasets.State('selectedDataset')
  selectedDataset
  @Datasets.Getter('selectedDatasetTimespan')
  selectedDatasetTimespan

  get minYear() {
    return parseInt(this.selectedDatasetTimespan[0])
  }

  get maxYear() {
    return parseInt(this.selectedDatasetTimespan[1])
  }

  get layerType() {
    return this.selectedDataset.variables.length > 1 ? 'base' : 'overlay'
  }

  get skopeWmsUrl() {
    return SKOPE_WMS_ENDPOINT
  }

  get defaultBaseMap() {
    return BaseMapEndpoints.default
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

  created() {
    this.$store.dispatch('datasets/loadDataset', this.$route.params.id)
    this.temporalRange = this.selectedDatasetTimespan
  }

  mounted() {
    this.$nextTick(() => {
      const map = this.$refs.layerMap.mapObject
      map.on('layeradd', event => {
        const layer = event.layer
        const isSkopeLayer = (layer.options.layers || '').startsWith('SKOPE')
        if (isSkopeLayer) {
          this.selectedLayer = layer
          this.updateWmsLegend(map, this.selectedLayer.wmsParams.layers)
        }
      })
      this.addDrawToolbar(map)
    })
  }

  head() {
    return {
      title: this.selectedDataset.title
    }
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
    map.addControl(drawControlFull)
    map.on(L.Draw.Event.CREATED, event => {
      drawnItems.addLayer(event.layer)
      drawControlFull.remove(map)
      drawControlEditOnly.addTo(map)
    })
    map.on(L.Draw.Event.DELETED, event => {
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
    const year = (this.year || this.maxYear).toString()
    const layer = fillTemplate(templateString, {
      year: year.padStart(4, '0')
    })
    return layer
  }

  updateYear(year) {
    this.year = year
    this.updateWmsLayer()
  }

  updateWmsLayer() {
    // hairy bit of code to:
    // 1. pull out the currently selected layer's layer template string
    // 2. update it with the current year
    // 3. reset the params on the currently selected layer to request the new layer from GeoServer
    if (this.selectedLayer !== null) {
      for (const wmsLayerRef of this.$refs.wmsLayers) {
        const wmsLayer = wmsLayerRef.mapObject
        if (wmsLayer === this.selectedLayer) {
          const layerTemplateString = wmsLayerRef.$vnode.data.key
          const layerName = this.fillTemplateYear(layerTemplateString)
          wmsLayer.setParams(
            { layers: this.fillTemplateYear(layerName) },
            false
          )
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
  height: 800px;
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
