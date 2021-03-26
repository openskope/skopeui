<template>
  <v-responsive :aspect-ratio="16 / 9">
    <LoadingSpinner v-if="isLoading" />
  </v-responsive>
</template>

<script>
import circleToPolygon from 'circle-to-polygon'
import _ from 'lodash'
import { Component } from 'nuxt-property-decorator'
import { namespace } from 'vuex-class'
import Vue from 'vue'

import LoadingSpinner from '@/components/global/LoadingSpinner.vue'
import Metadata from '@/components/action/Metadata.vue'
import Map from '@/components/Map.vue'

const fillTemplate = require('es6-dynamic-template')
const Dataset = namespace('dataset')

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
  @Dataset.State('metadata')
  metadata
  @Dataset.Getter('timespan')
  timespan
  @Dataset.Getter('timeZero')
  timeZero

  stepNames = _.clone(this.$api().app.stepNames)

  dialog = false
  instructions = false
  confirmGeometry = false
  clear = false

  get isLoading() {
    return _.isNull(this.metadata)
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name)
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
