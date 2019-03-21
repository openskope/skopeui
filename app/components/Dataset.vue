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
            <l-control-scale />
            <l-tile-layer :url="url" :attribution="attribution" />
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
            <vue-markdown :source="description" />
          </v-card-text>
          <v-list dense light>
            <v-subheader class="title">
              Variables
            </v-subheader>
            <v-list-tile v-for="(variable, index) in variables" :key="index" avatar>
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
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:
        "&copy; <a target='_blank' href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
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
    initMap() {},
    initLayers() {}
  }
})
export default class Dataset extends Vue {}
</script>
<style>
.map {
  height: 100%;
}
.variable {
  height: 3em;
}
</style>
