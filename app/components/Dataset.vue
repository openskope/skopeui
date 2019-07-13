<template>
  <v-layout row pa-2 mb-2 align-content-start justify-space-around fill-height>
    <v-flex xs4>
      <div class="map px-2">
        <no-ssr>
          <l-map
            :min-zoom="2"
            :max-zoom="8"
            :zoom="region.zoom"
            :center="region.center"
          >
            <l-control-scale />
            <l-tile-layer
              :url="defaultBaseMap.url"
              :attribution="defaultBaseMap.attribution"
            />
            <l-rectangle :bounds="region.extents" :l-style="region.style" />
          </l-map>
        </no-ssr>
      </div>
    </v-flex>
    <v-flex xs8>
      <div class="px-2">
        <v-card>
          <v-card-title class="pb-0">
            <h2 class="headline">
              <nuxt-link :to="absoluteUrl" class="blue--text">
                {{ title }}
              </nuxt-link>
            </h2>
          </v-card-title>
          <v-subheader class="subheading">
            {{ spatialCoverage }} | {{ temporalCoverage }}
          </v-subheader>
          <v-card-text class="body">
            <vue-markdown :source="description" />
          </v-card-text>
          <!-- FIXME: extract this to a component and reuse across the detail page -->
          <v-list three-line dense light>
            <v-list-tile
              v-for="(variable, index) in selectedDataset.variables"
              :key="index"
              avatar
            >
              <v-list-tile-content>
                <v-list-tile-title class="variable">
                  <v-chip
                    small
                    color="indigo"
                    text-color="white"
                    disabled="false"
                  >
                    <v-icon>view_column</v-icon>
                    {{ variable.class }}
                  </v-chip>
                  {{ variable.name }}
                </v-list-tile-title>
                <v-list-tile-sub-title class="my-0 py-0 mx-3">
                  {{ variable.description }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <v-card-text>
            <div class="py-3 citation">
              <em class="font-weight-bold">
                Source:
              </em>
              <nuxt-link class="font-weight-thin" :to="sourceUrl">
                {{ sourceUrl }}
              </nuxt-link>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import Vue from 'vue'
import VueMarkdown from 'vue-markdown'
import Component from 'nuxt-class-component'
import { BaseMapEndpoints } from '~/store/constants.js'

@Component({
  props: {
    title: String,
    status: String,
    revised: String,
    region: Object,
    timespan: Object,
    description: String,
    variables: Array,
    id: String,
    sourceUrl: String
  },
  components: { VueMarkdown },
  // app specific functions
  computed: {
    defaultCrs() {
      if (this.$L) {
        return this.$L.CRS.EPSG4326
      }
      return ''
    }
  },
  methods: {
    initMap() {},
    initLayers() {}
  }
})
class Dataset extends Vue {
  get defaultBaseMap() {
    return BaseMapEndpoints.default
  }
  get spatialCoverage() {
    return `${this.region.name} at ${this.region.resolution}`
  }
  get temporalCoverage() {
    const period = this.timespan.period
    const timespan =
      period.gte === period.lte ? period.gte : `${period.gte}-${period.lte}`
    return `${timespan}${period.suffix} ${this.timespan.resolutionLabel}`
  }
  get absoluteUrl() {
    return '/dataset/' + this.id
  }
}
export default Dataset
</script>
<style scoped>
.map {
  height: 100%;
  position: relative;
  z-index: 1;
}
.variable {
  height: 3em;
}
</style>
