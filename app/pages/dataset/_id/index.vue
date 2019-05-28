<template>
  <v-layout row>
    <v-flex md12>
      <v-card flat tile>
        <v-container fill-width fluid>
          <Dataset v-bind="selectedDataset" />
          <v-expansion-panel light>
            <v-expansion-panel-content>
              <template v-slot:header>
                <div class="title">
                  Detailed Metadata
                </div>
              </template>
              <v-layout fill-height>
                <v-card-text>
                  <div v-for="(label, attr) in metadataAttributes" :key="attr" class="py-1">
                    <span class="font-weight-bold">
                      {{ label }}:
                    </span> <vue-markdown>{{ selectedDataset[attr] }}</vue-markdown>
                  </div>
                </v-card-text>
              </v-layout>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-divider />
          <v-layout column align-center justify-center>
            <v-flex xs12>
              <v-card-text>
                <div style="height: 600px; width: 600px;">
                  <no-ssr placeholder="Loading...">
                    <l-map
                      ref="layerMap"
                      :zoom="selectedDataset.region.zoom"
                      :center="selectedDataset.region.center"
                      style="height: 100%"
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
          </v-layout>
        </v-container>
        <v-card-actions class="justify-space-between">
          <v-btn
            flat
            @click="prev"
          >
            <v-icon>chevron_left</v-icon>
          </v-btn>
          <v-item-group
            v-model="onboarding"
            class="text-xs-center"
            manadatory
          >
            <v-item
              v-for="n in length"
              :key="`btn-${n}`"
            >
              <v-btn
                slot-scope="{ active, toggle }"
                :input-value="active"
                icon
                @click="toggle"
              >
                <v-icon color="black">
                  fiber_manual_record
                </v-icon>
              </v-btn>
            </v-item>
          </v-item-group>
          <v-btn
            flat
            @click="next"
          >
            <v-icon>chevron_right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import { createNamespacedHelpers } from 'vuex'
import { stringify } from 'query-string'
import { SKOPE_WMS_ENDPOINT, BaseMapEndpoints } from '~/store/constants.js'
import Dataset from '~/components/Dataset.vue'
const fillTemplate = require('es6-dynamic-template')
const { mapState, mapGetters } = createNamespacedHelpers('datasets')

export default {
  layout: 'dataset',
  components: {
    Dataset,
    VueMarkdown
  },
  data() {
    return {
      length: 3,
      onboarding: 0,
      temporalRange: [],
      selectedLayer: undefined,
      legendControl: undefined,
      legendImage: undefined
    }
  },
  computed: {
    // retrieve the dataset corresponding to the given route params id in the datastore
    // FIXME: needs error checking 404 if the dataset doesn't exist
    ...mapState(['selectedDataset']),
    ...mapGetters(['selectedDatasetTimespan']),
    // FIXME: lift these into a store instead
    skopeWmsUrl() {
      return SKOPE_WMS_ENDPOINT
    },
    defaultBaseMap() {
      return BaseMapEndpoints.default
    },
    metadataAttributes() {
      return {
        originator: 'Originator',
        uncertainty: 'Uncertainty',
        methodSummary: 'Method Summary',
        references: 'References',
        contactInformation: 'Contact Information'
      }
    },
    defaultCrs() {
      if (this.$L) {
        return this.$L.CRS.EPSG4326
      }
      return ''
    }
  },
  created() {
    this.$store.dispatch('datasets/loadDataset', this.$route.params.id)
    this.temporalRange = this.selectedDatasetTimespan
  },
  mounted() {
    this.$nextTick(() => {
      console.log(this.$refs.layerMap.mapObject)
      this.$refs.layerMap.mapObject.on('layeradd', event => {
        console.log(event)
        this.selectedLayer = event.layer
        this.updateWmsLegend(event.target, this.selectedLayer.wmsParams.layers)
      })
    })
  },
  head() {
    return {
      title: this.selectedDataset.title
    }
  },
  methods: {
    next() {
      this.onboarding = (this.onboarding + 1) % this.length
    },
    prev() {
      this.onboarding = (this.onboarding - 1 + this.length) % this.length
    },
    setLegendImage(htmlElement) {
      this.legendImage = htmlElement
    },
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
    },
    updateWmsLegend(map, layerName) {
      const L = this.$L
      const wmsLegendUrl = this.generateWmsLegendUrl(layerName)
      if (this.legendControl === undefined) {
        const legend = L.control({ position: 'bottomright' })
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
    },
    fillTemplateYear(templateString) {
      const year = this.temporalRange[0].toString()
      const layer = fillTemplate(templateString, {
        year: year.padStart(4, '0')
      })
      return layer
    },
    updateWmsLayer(event) {
      if (this.selectedLayer !== undefined) {
        for (const wmsLayerRef of this.$refs.wmsLayers) {
          const wmsLayer = wmsLayerRef.mapObject
          if (wmsLayer === this.selectedLayer) {
            console.log(wmsLayer)
            const layerTemplateString = wmsLayerRef.$vnode.data.key
            const layerName = this.fillTemplateYear(layerTemplateString)
            // programmatically add the legend to the mapObject
            this.updateWmsLegend(
              wmsLayerRef.parentContainer.mapObject,
              layerName
            )
            wmsLayer.setParams(
              { layers: this.fillTemplateYear(layerName) },
              false
            )
          }
        }
      }
    }
  },
  validate({ params }) {
    return /^\w+$/.test(params.id)
  }
}
</script>
