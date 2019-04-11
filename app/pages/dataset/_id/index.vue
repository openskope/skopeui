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
              <v-layout fill-height>
                <v-card-text>
                  <div v-for="(label, attr) in metadataAttributes" :key="attr" class="py-1">
                    <span class="font-weight-bold">
                      {{ label }}:
                    </span> <vue-markdown>{{ selectedDataset[attr] }}</vue-markdown>
                  </div>
                </v-card-text>
              </v-layout>
            </v-container>
            <v-divider />
            <v-container grid-list-md fill-height fill-width>
              <v-layout column align-center justify-center>
                <v-flex xs12>
                  <v-card-text>
                    <div style="height: 600px; width: 600px;">
                      <no-ssr placeholder="Loading...">
                        <l-map
                          :zoom="selectedDataset.region.zoom"
                          :center="transformedCenterCoordinates"
                          :crs="defaultCrs"
                          style="height: 100%"
                        >
                          <l-control-scale />
                          <l-tile-layer 
                            :url="defaultBaseMap.url"
                            :attribution="defaultBaseMap.attribution"
                            :cross-origin="true"
                            :transparent="false"
                          />
                          <l-wms-tile-layer
                            v-for="variable in selectedDataset.variables"
                            :key="variable.wmsLayer"
                            :base-url="skopeWmsUrl"
                            :layers="fillTemplateYear(variable.wmsLayer)"
                            :name="variable.name"
                            :transparent="true"
                            :visible="false"
                            :styles="variable.styles"
                            :cross-origin="true"
                            layer-type="base"
                            version="1.3.0"
                            format="image/png"
                          />
                        </l-map>
                      </no-ssr>
                    </div>
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
import Dataset from '~/components/Dataset.vue'
import { SKOPE_WMS_ENDPOINT, BaseMapEndpoints } from '~/store/constants.js'
import VueMarkdown from 'vue-markdown'
const fillTemplate = require('es6-dynamic-template')

export default {
  components: {
    Dataset,
    VueMarkdown
  },
  data() {
    return {
      length: 3,
      onboarding: 0
    }
  },
  computed: {
    selectedDataset() {
      // retrieve the dataset corresponding to the given route params id in the datastore
      // FIXME: needs error checking 404 if the dataset doesn't exist
      const id = this.$route.params.id
      return this.$store.state.datasets.all.find(dataset => dataset.id === id)
    },
    skopeWmsUrl() {
      return SKOPE_WMS_ENDPOINT
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
    defaultBaseMap() {
      return BaseMapEndpoints.default
    },
    defaultCrs() {
      if (this.$L) {
        return this.$L.CRS.EPSG4326
      }
      return ''
    },
    transformedCenterCoordinates() {
      const coordinates = this.selectedDataset.region.center
      return [coordinates[1], coordinates[0]]
    }
  },
  created() {
    this.$store.dispatch('datasets/load')
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
    fillTemplateYear(templateString, year) {
      // FIXME: year should be injected from data slider
      if (year === undefined) {
        year = '1'
      }
      const layer = fillTemplate(templateString, {
        year: year.padStart(4, '0')
      })
      return layer
    }
  },
  validate({ params }) {
    return /^\w+$/.test(params.id)
  }
}
</script>
