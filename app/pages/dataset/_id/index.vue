<template>
  <v-layout row>
    <v-flex md12>
      <v-card flat tile>
        <v-container fill-width fluid>
          <v-layout
            row
            pa-2
            mb-2
            align-content-start
            justify-space-around
            fill-height
          >
            <v-flex xs6>
              <v-card-text>
                <div style="height: 500px;">
                  <no-ssr placeholder="Loading...">
                    <l-map
                      ref="layerMap"
                      :zoom="selectedDataset.region.zoom"
                      :center="selectedDataset.region.center"
                      style="z-index: 1"
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
                        :crs="defaultCrs"
                        :base-url="skopeWmsUrl"
                        :layers="fillTemplateYear(variable.wmsLayer)"
                        :name="variable.name"
                        :transparent="true"
                        :visible="variable.visible"
                        :opacity="0.5"
                        layer-type="base"
                        version="1.3.0"
                        format="image/png"
                      />
                    </l-map>
                  </no-ssr>
                </div>
                <v-subheader class="title">
                  Date range (year)
                </v-subheader>
                <v-layout row align-center justify-center>
                  <v-flex shrink style="width: 60px">
                    <v-text-field
                      v-model="temporalRange[0]"
                      style="width: 50px"
                      hide-details
                      single-line
                      type="number"
                    />
                  </v-flex>
                  <v-flex class="px-3">
                    <v-range-slider
                      v-model="temporalRange"
                      :max="2019"
                      :min="1"
                      :step="1"
                      @change="updateWmsLayer"
                    />
                  </v-flex>
                  <v-flex>
                    <v-text-field
                      v-model="temporalRange[1]"
                      style="width: 50px"
                      hide-details
                      single-line
                      type="number"
                    />
                  </v-flex>
                </v-layout>
              </v-card-text>
              <v-card-actions>
                <v-layout align-center justify-center>
                  <v-icon>play_circle_filled</v-icon>
                  <v-icon>pause</v-icon>
                  <v-icon>stop</v-icon>
                </v-layout>
              </v-card-actions>
            </v-flex>
            <v-flex xs6>
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
                  <v-list dense light>
                    <v-subheader class="title">
                      Variables
                    </v-subheader>
                    <v-list-tile v-for="(variable, index) in selectedDataset.variables" :key="index" avatar>
                      <v-list-tile-content>
                        <v-list-tile-title class="variable">
                          <v-chip small color="secondary">
                            {{ variable.class }}
                          </v-chip> {{ variable.name }}
                        </v-list-tile-title>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                  <v-card-text>
                    <div class="py-3 citation">
                      <em class="font-weight-bold">
                        Source:
                      </em> <nuxt-link class="font-weight-thin" :to="selectedDataset.sourceUrl">
                        {{ selectedDataset.sourceUrl }}
                      </nuxt-link>
                    </div>
                  </v-card-text>
                  <v-card-text>
                    <div v-for="(label, attr) in metadataAttributes" :key="attr" class="py-1">
                      <span class="font-weight-bold">
                        {{ label }}:
                      </span> <vue-markdown>{{ selectedDataset[attr] }}</vue-markdown>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
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
export default class DatasetDetail extends Vue {
  length = 3
  onboarding = 0
  temporalRange = []
  selectedLayer = undefined
  legendControl = undefined
  legendImage = undefined
  legendPosition = 'bottomleft'

  @Datasets.State('selectedDataset')
  selectedDataset
  @Datasets.Getter('selectedDatasetTimespan')
  selectedDatasetTimespan

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
    const period = this.selectedDataset.timespan.period
    const timespan =
      period.gte === period.lte ? period.gte : `${period.gte}-${period.lte}`
    return `${timespan}${period.suffix}
     ${this.selectedDataset.timespan.resolutionLabel}`
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

  generateWmsLegendUrl(layerName) {
    const query = {
      REQUEST: 'GetLegendGraphic',
      VERSION: '1.0.0',
      FORMAT: 'image/png',
      LAYER: layerName,
      LEGEND_OPTIONS: 'layout:vertical;dx:10'
    }
    const queryString = stringify(query)
    console.log(queryString)
    const legendUrl = this.skopeWmsUrl + queryString
    console.log(legendUrl)
    return legendUrl
  }

  updateWmsLegend(map, layerName) {
    const L = this.$L
    const wmsLegendUrl = this.generateWmsLegendUrl(layerName)
    if (this.legendControl === undefined) {
      const legend = L.control({ position: this.legendPosition })
      console.log(map)
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
    if (this.legendImage !== undefined) {
      console.log(this.legendImage)
      this.legendImage.src = wmsLegendUrl
    }
  }

  fillTemplateYear(templateString) {
    const year = this.temporalRange[0].toString()
    const layer = fillTemplate(templateString, {
      year: year.padStart(4, '0')
    })
    return layer
  }

  updateWmsLayer(event) {
    if (this.selectedLayer !== undefined) {
      for (const wmsLayerRef of this.$refs.wmsLayers) {
        const wmsLayer = wmsLayerRef.mapObject
        if (wmsLayer === this.selectedLayer) {
          console.log(wmsLayer)
          const layerTemplateString = wmsLayerRef.$vnode.data.key
          const layerName = this.fillTemplateYear(layerTemplateString)
          // programmatically add the legend to the mapObject
          this.updateWmsLegend(wmsLayerRef.parentContainer.mapObject, layerName)
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
</script>
