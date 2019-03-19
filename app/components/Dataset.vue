<template>
  <v-layout
    row
    pa-2
    mb-2 
    align-content-start 
    justify-space-around 
    fill-height
  >
    <v-flex xs4>
      <div class="map px-2">
        <no-ssr>
          <l-map
            :min-zoom="2"
            :max-zoom="8"
            :zoom="region.zoom"
            :center="region.center"
          >
            <l-tile-layer :url="url" />
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
              <nuxt-link :to="absolute_url" class="blue--text">
                {{ title }}
              </nuxt-link>
            </h2>
          </v-card-title>
          <v-subheader class="subheading">
            {{ region.name }} at {{ region.resolution }}
            |
            {{ timespan.name }}
          </v-subheader>
          <v-card-text class="body">
            <vue-markdown class="body">{{ description }}</vue-markdown>
            <v-list dense light>
              <v-subheader class="title">
                Variables
              </v-subheader>
              <v-list-tile v-for="(variable, index) in variables" :key="index">
                <v-list-tile-content>
                  <v-list-tile-title>
                    <v-chip small color="secondary">
                      {{ variable.class }}
                    </v-chip> {{ variable.name }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
            <div class="py-3 citation">
              <em class="font-weight-bold">
                Source:
              </em> <nuxt-link class="font-weight-thin" :to="source_url">
                {{ source_url }}
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
import Component from 'vue-class-component'
import VueMarkdown from 'vue-markdown'

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
    absolute_url: String,
    source_url: String
  },
  components: { VueMarkdown },
  // data properties
  data() {
    return {
      zoom: 2,
      center: [35, -105], // FIXME: should be generated dynamically
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      baseUrl: 'https://app.openskope.org/geoserver/SKOPE/wms?',
      layers: [
        {
          name: 'PaleoCAR PPT',
          visible: true,
          layers: 'SKOPE:paleocar_ppt_0001-01-01',
          transparent: true,
          overlay: true
        },
        {
          name: 'PaleoCAR GDD',
          visible: true,
          transparent: true,
          overlay: true,
          layers: 'SKOPE:paleocar_gdd_0001-01-01'
        }
      ]
    }
  },
  // when app is mounted
  mounted() {},
  // app specific functions
  methods: {
    initMap() {
      // this.map = L.map('map').setView([38.63, -90.23], 12)
      // this.tileLayer = L.tileLayer(
      //   'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
      //   {
      //     maxZoom: 18,
      //     attribution:
      //       '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
      //   }
      // )
      // this.tileLayer.addTo(this.map)
    },
    initLayers() {}
  }
})
export default class Dataset extends Vue {}
</script>
<style>
.map {
  height: 100%;
}
</style>
