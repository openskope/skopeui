<template>
  <v-layout class="pb-3" row justify-around>
    <v-flex xs3>
      <div style="height: 100%">
        <no-ssr>
          <l-map
            :min-zoom="13"
            :max-zoom="13"
            :zoom="13"
            :center="[38.63,-90.23]"
          >
            <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" :draggable="false" />
            <l-marker :lat-lng="[47.413220, -1.219482]" />
          </l-map>
        </no-ssr>
      </div>
    </v-flex>
    <v-flex xs9>
      <div class="pr-3">
        <h2>
          <nuxt-link :to="url">
            {{ title }}
          </nuxt-link>
        </h2>
        <p class="font-weight-light">
          {{ region.name }} at {{ region.resolution }}
          |
          {{ timespan.name }}
        </p>
        <vue-markdown>{{ description }}</vue-markdown>
        <div v-if="variables.length > 0">
          <h3>Variables</h3>
          <ul>
            <li v-for="variable in variables" :key="variable.name">
              {{ variable.name }}
            </li>
          </ul>
        </div>
        <div v-else>
          <v-alert :value="true" type="info">
            No variables defined
          </v-alert>
        </div>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import VueMarkdown from 'vue-markdown'
// import L from 'vue2-leaflet'

let leaflet1

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
    url: String,
    lowerBound: Object,
    upperBound: Object
  },
  components: { VueMarkdown },
  // data properties
  data() {
    return {
      map: null,
      titleLayer: null,
      layers: []
    }
  },
  // when app is mounted
  mounted() {
    //
    this.$nextTick(() => {
      // leaflet1 = this.$L
      console.log(leaflet1) // eslint-disable-line
    })
    // console.alert('done here')
  },
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
  },
  computed: {
    dataset() {
      // accesses store, navigates to state, goes to datasets module, get all datasets
      // that live in "all" property
      return this.$store.state.datasets.all
    }
  }
})
export default class Dataset extends Vue {}
</script>
