<template>
  <v-responsive height="100%" width="100%">
    <LoadingSpinner v-if="isLoading" />
    <template v-else>
      <v-row class="d-flex flex-column" style="height: 100%">
        <!-- title -->
        <v-col
          class="d-flex flex-row flex-grow-0 flex-shrink-1 ma-0 px-10 pb-0 pt-10"
        >
          <v-dialog
            v-model="confirmGeometry"
            transition="dialog-bottom-transition"
            max-width="600"
          >
            <template #default="confirmGeometry">
              <v-card class="pa-6">
                <v-card-text>
                  <h3>
                    Welcome back! Would you like to clear the currently selected
                    area?
                  </h3>
                </v-card-text>
                <v-card-actions class="justify-end">
                  <v-btn
                    depressed
                    color="info"
                    @click="confirmGeometry.value = false"
                    >Keep selected area</v-btn
                  >
                  <v-btn depressed color="warning" @click="clearGeometry"
                    >Clear selected area</v-btn
                  >
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
          <h1 class="font-weight-light">
            {{ metadata.title }}
          </h1>
          <v-tooltip bottom
            ><template #activator="{ on, attrs }">
              <v-btn icon color="secondary" class="mx-3">
                <v-icon
                  v-bind="attrs"
                  large
                  @click="instructions = !instructions"
                  v-on="on"
                  >info</v-icon
                >
              </v-btn> </template
            ><span>Instructions</span></v-tooltip
          >
          <v-dialog v-model="dialog" max-width="600px">
            <template #activator="{ on, attrs }">
              <v-btn depressed color="accent" v-bind="attrs" v-on="on"
                >View Metadata</v-btn
              >
            </template>
            <v-card>
              <v-card-title class="accent text--white">
                Metadata
                <v-spacer></v-spacer>
                <v-btn icon @click="dialog = false">
                  <v-icon color="white">fas fa-window-close</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-text><Metadata /></v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="dialog = false">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-spacer></v-spacer>
          <v-btn
            depressed
            color="accent"
            :disabled="!hasValidStudyArea"
            @click="goToViz($route.params.id)"
            >Go to Visualize
            <v-icon small class="ml-2" color="white"
              >fas fa-chevron-right</v-icon
            ></v-btn
          >
        </v-col>
        <!-- instructions -->
        <v-col class="flex-grow-0 flex-shrink-1 ma-0 px-10 pb-0">
          <v-alert
            v-model="instructions"
            color="secondary"
            type="info"
            text
            outlined
            dismissible
          >
            Select the geometry for the dataset by using the drawing tools on
            the map. A geometry must be defined in order to visualize and
            analyze the dataset.
          </v-alert>
        </v-col>
        <!-- map -->
        <v-col id="map-flex" class="flex-grow-1 flex-shrink-0 ma-0 pa-0">
          <v-card
            class="mx-10"
            height="85%"
            elevation="2"
            style="z-index: 1"
            outlined
          >
            <v-card-title>
              <h1 class="headline">Map</h1>
              <v-spacer></v-spacer>
              <h3 class="headline">
                Selected area: {{ selectedArea }} km<sup>2</sup>
              </h3>
            </v-card-title>
            <Map class="mx-0" />
            <v-toolbar>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    v-on="on"
                    @click="exportSelectedGeometry"
                  >
                    <a id="exportSelectedGeometry">
                      <v-icon>fas fa-download</v-icon>
                    </a>
                  </v-btn>
                </template>
                <span>Download selected geometry as a GeoJSON file</span>
              </v-tooltip>
              <input
                id="loadGeoJsonFile"
                type="file"
                style="display: none"
                @change="loadGeoJson"
              />
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    v-on="on"
                    @click="selectGeoJsonFile"
                  >
                    <v-icon>fas fa-upload</v-icon>
                  </v-btn>
                </template>
                <span>Upload a GeoJSON file</span>
              </v-tooltip>
              <v-spacer></v-spacer>
            </v-toolbar>
            <!-- end toolbar -->
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-responsive>
</template>

<script>
import circleToPolygon from 'circle-to-polygon'
import _ from 'lodash'
import { Component } from 'nuxt-property-decorator'
import Vue from 'vue'

import LoadingSpinner from '@/components/global/LoadingSpinner.vue'
import Metadata from '@/components/action/Metadata.vue'
import Map from '@/components/Map.vue'

const fillTemplate = require('es6-dynamic-template')

@Component({
  layout: 'BaseDataset',
  components: {
    // load time series plotly component lazily to avoid document is not defined errors
    // https://stackoverflow.com/a/50458090
    LoadingSpinner,
    Metadata,
    Map,
  },
})
class DatasetDetail extends Vue {
  stepNames = _.clone(this.$api().app.stepNames)

  dialog = false
  instructions = false
  confirmGeometry = false

  get isLoading() {
    return _.isNull(this.metadata)
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name)
  }

  get metadata() {
    return this.$api().dataset.metadata
  }

  get timespan() {
    return this.$api().dataset.timespan
  }

  get timeZero() {
    return this.$api().dataset.timeZero
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep == 0 || this.$api().dataset.hasGeometry
  }

  get selectedArea() {
    return (this.$api().dataset.selectedAreaInSquareMeters / 1000000.0).toFixed(
      2
    )
  }

  get savedGeometry() {
    const skopeGeometry = this.$warehouse.get(this.wGeometryKey)
    console.log('skope geometry: ', skopeGeometry)
    if (skopeGeometry) {
      return JSON.parse(skopeGeometry)
    } else {
      return false
    }
  }

  // created lifecycle hook
  async created() {
    const api = this.$api()
    api.dataset.loadMetadata(this.$route.params.id)
    this.minTemporalRange = this.timespanMinYear
    this.maxTemporalRange = this.timespanMaxYear
    this.confirmGeometry = this.hasValidStudyArea
  }

  head() {
    return {
      title: this.metadata.title,
    }
  }

  loadGeoJson(event) {
    const file = event.target.files[0]
    file.text().then((text) => {
      console.log('received possible geojson to load: ', text)
      try {
        let area = JSON.parse(text)
        this.restoreSelectedGeometry(area)
      } catch (error) {
        console.error(error)
        // FIXME: this should be a toast or other notification
        alert("Sorry! We couldn't re-import this file: " + text)
      }
    })
  }

  selectGeoJsonFile() {
    document.getElementById('loadGeoJsonFile').click()
  }

  exportSelectedGeometry(event) {
    const geometry = this.savedGeometry
    console.log(' saved geometry ', { geometry })
    if (geometry) {
      console.log('exporting selected geometry: ', { geometry })
      const convertedArea =
        'text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(geometry))
      const button = document.getElementById('exportSelectedGeometry')
      button.setAttribute('href', 'data:' + convertedArea)
      button.setAttribute('download', `${this.wGeometryKey}.geojson`)
    }
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
      this.selectedAreaInSquareMeters =
        layer.getRadius() * layer.getRadius() * Math.PI
    } else if (layer instanceof L.Marker) {
      this.selectedAreaInSquareMeters = 0
    } else {
      this.selectedAreaInSquareMeters = L.GeometryUtil.geodesicArea(
        layer.getLatLngs()[0]
      )
    }
    this.$api().dataset.setGeometry({
      geometry: data.geometry,
      area: this.selectedAreaInSquareMeters,
    })
  }

  saveSelectedGeometry(geoJson) {
    this.$warehouse.set(this.wGeometryKey, JSON.stringify(geoJson))
  }

  checkAndRestoreSavedGeometry(map) {
    const savedGeometry = this.savedGeometry
    if (savedGeometry) {
      this.restoreSelectedGeometry(savedGeometry, map)
    }
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

  validate({ params }) {
    return /^\w+$/.test(params.id)
  }

  goToViz(id) {
    if (_.isUndefined(id) || !this.hasValidStudyArea) {
      return
    }
    this.$router.push({ name: 'dataset-id-visualize', params: { id } })
  }

  async clearGeometry() {
    this.confirmGeometry = false
    this.$api().dataset.clearGeometry()
  }
}
export default DatasetDetail
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

@media all and (max-width: 960px) {
  #map-flex {
    height: 400px;
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

.header {
  color: white;
}

ul.leaflet-draw-actions.leaflet-draw-actions-bottom li a[title='Save changes'] {
  display: none;
}

/*.card {*/
/*  background: rgb(73, 190, 131);*/
/*  background: linear-gradient(*/
/*    90deg,*/
/*    rgba(73, 190, 131, 1) 0%,*/
/*    rgba(81, 192, 139, 1) 50%,*/
/*    rgba(88, 193, 145, 1) 100%*/
/*  );*/
/*}*/
</style>
