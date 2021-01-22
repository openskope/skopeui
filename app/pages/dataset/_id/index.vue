<template>
  <v-responsive :aspect-ratio="16 / 9">
    <v-row justify="space-around" class="my-5">
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
                geometry?
              </h3>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn
                depressed
                color="info"
                @click="confirmGeometry.value = false"
                >Keep saved geometry</v-btn
              >
              <v-btn depressed color="warning" @click="clearGeometry"
                >Clear geometry</v-btn
              >
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <h2 class="ml-3">
        {{ selectedDataset.title }}
      </h2>
      <v-tooltip bottom
        ><template #activator="{ on, attrs }">
          <v-icon
            class="mx-2"
            v-bind="attrs"
            @click="instructions = !instructions"
            v-on="on"
            >info</v-icon
          > </template
        ><span>Instructions</span></v-tooltip
      >
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template #activator="{ on, attrs }">
          <v-btn depressed color="accent" v-bind="attrs" v-on="on"
            >View Metadata</v-btn
          >
        </template>
        <v-card>
          <v-card-title class="accent text--white">Metadata</v-card-title>
          <v-card-text class="my-3"><Metadata /></v-card-text>
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
        >Next</v-btn
      >
    </v-row>
    <v-row>
      <v-col class="mx-auto">
        <v-alert
          v-model="instructions"
          outlined
          text
          border="left"
          dismissible
          type="info"
        >
          These are the dismissable instructions for this page.
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col id="map-flex" class="mx-auto">
        <v-card flat outlined class="map">
          <v-card-title class="secondary"><h3>Map</h3></v-card-title>
          <Map :clear="clear" />
          <v-sheet inset>
            <v-toolbar class="primary" flat dense>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    color="white"
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
                    color="white"
                    v-on="on"
                    @click="selectGeoJsonFile"
                  >
                    <v-icon>fas fa-upload</v-icon>
                  </v-btn>
                </template>
                <span>Upload a GeoJSON file</span>
              </v-tooltip>
              <template v-if="selectedArea > 0">
                Selected area: {{ selectedArea }} km<sup>2</sup>
              </template>
              <v-spacer></v-spacer>
            </v-toolbar>
            <!-- end toolbar -->
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>
  </v-responsive>
</template>

<script>
import circleToPolygon from 'circle-to-polygon'
import { clamp } from 'lodash'
import { Component } from 'nuxt-property-decorator'
import { Prop } from 'vue-property-decorator'
import { stringify } from 'query-string'
import { namespace } from 'vuex-class'
import Vue from 'vue'

import {
  LEAFLET_PROVIDERS,
  SKOPE_WMS_ENDPOINT,
} from '@/store/modules/constants.js'
import Metadata from '@/components/action/Metadata.vue'
import Map from '@/components/Map.vue'

const fillTemplate = require('es6-dynamic-template')
const Datasets = namespace('datasets')

@Component({
  layout: 'BaseDataset',
  components: {
    // load time series plotly component lazily to avoid document is not defined errors
    // https://stackoverflow.com/a/50458090
    Metadata,
    Map,
  },
})
class DatasetDetail extends Vue {
  @Datasets.State('selectedDataset')
  selectedDataset
  @Datasets.Getter('selectedDatasetTimespan')
  selectedDatasetTimespan
  @Datasets.Getter('selectedDatasetTimeZero')
  selectedDatasetTimeZero

  stepNames = _.clone(this.$api().app.stepNames)

  dialog = false
  instructions = false
  confirmGeometry = false
  clear = false

  // created lifecycle hook
  async created() {
    const d = this.$api().datasets
    await d.loadDataset(this.$route.params.id)
    this.minTemporalRange = this.timespanMinYear
    this.maxTemporalRange = this.timespanMaxYear
    this.confirmGeometry = this.hasValidStudyArea
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name)
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep == 0 || this.$api().dataset.hasGeometry
  }

  get selectedArea() {
    if (this.selectedAreaInSquareMeters > 0) {
      return Number.parseFloat(
        this.selectedAreaInSquareMeters / 1000000.0
      ).toFixed(2)
    }
  }

  get selectedArea() {
    if (this.selectedAreaInSquareMeters > 0) {
      return Number.parseFloat(
        this.selectedAreaInSquareMeters / 1000000.0
      ).toFixed(2)
    }
  }

  head() {
    return {
      title: this.selectedDataset.title,
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
    const geometry = this.getSavedGeometry()
    if (geometry) {
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
      this.selectedAreaInSquareMeters = layer.getRadius() * Math.PI * Math.PI
    } else if (layer instanceof L.Marker) {
      this.selectedAreaInSquareMeters = 0
    } else {
      this.selectedAreaInSquareMeters = L.GeometryUtil.geodesicArea(
        layer.getLatLngs()[0]
      )
    }
    this.selectedGeometry = data.geometry
  }

  saveSelectedGeometry(geoJson) {
    this.$warehouse.set(this.wGeometryKey, JSON.stringify(geoJson))
  }

  checkAndRestoreSavedGeometry(map) {
    const savedGeometry = this.getSavedGeometry()
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

  getSavedGeometry() {
    const skopeGeometry = this.$warehouse.get(this.wGeometryKey)
    if (skopeGeometry) {
      return JSON.parse(skopeGeometry)
    }
    return false
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
    this.clear = true
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

#map-flex {
  height: 75vh;
  margin-bottom: 2rem;
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

.variable {
  height: 3em;
}
</style>
