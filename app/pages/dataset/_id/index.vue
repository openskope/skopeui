<template>
  <v-layout row>
    <v-flex md12>
      <v-card flat tile>
        <v-window v-model="onboarding">
          <v-window-item
            v-for="n in length"
            :key="`card-${n}`"
          >
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
                          :zoom="selectedDataset.region.zoom"
                          :center="selectedDataset.region.center"
                          style="height: 100%"
                        >
                          <l-control-scale />
                          <l-control-layers />
                          <l-tile-layer 
                            :url="defaultBaseMap.url"
                            :attribution="defaultBaseMap.attribution"
                            :cross-origin="true"
                            :transparent="false"
                          />
                          <l-wms-tile-layer
                            v-for="variable in selectedDataset.variables"
                            ref="wmsLayers"
                            :key="variable.wmsLayer"
                            :crs="defaultCrs"
                            :base-url="skopeWmsUrl"
                            :layers="fillTemplateYear(variable.wmsLayer)"
                            :name="variable.name"
                            :transparent="true"
                            :visible="true"
                            :cross-origin="true"
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
          </v-window-item>
        </v-window>
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
      temporalRange: []
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
    fillTemplateYear() {
      return templateString => {
        const year = this.temporalRange[0].toString()
        const layer = fillTemplate(templateString, {
          year: year.padStart(4, '0')
        })
        console.log('layer')
        console.log(layer)
        return layer
      }
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
    console.log(this.selectedDataset.variables)
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
    }
  },
  validate({ params }) {
    return /^\w+$/.test(params.id)
  }
}
</script>
