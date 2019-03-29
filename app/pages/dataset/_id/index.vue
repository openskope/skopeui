<template>
  <v-layout row>
    <v-flex md12>
      <div class="nav">
        <v-layout row wrap>
          <v-btn flat icon to="/" class="arrow_back">
            <v-icon color="grey darken-2">
              arrow_back
            </v-icon>
          </v-btn>
          <v-stepper alt-labels non-linear class="stepper">
            <v-stepper-header>
              <v-stepper-step
                editable
                step="1"
              >
                Datasets
              </v-stepper-step>
              <v-divider />
              <v-stepper-step
                editable
                step="2"
              >
                Info
              </v-stepper-step>
              <v-divider />
              <v-stepper-step
                step="3"
                editable
              >
                Map
              </v-stepper-step>
            </v-stepper-header>
          </v-stepper>
          <v-btn flat icon to="/map" class="arrow_forward">
            <v-icon color="grey darken-2">
              arrow_forward
            </v-icon>
          </v-btn>
        </v-layout>
      </div>
      <v-card>
        <v-container fill-width fluid>
          <Dataset v-bind="dataset" />
          <v-layout fill-height>
            <v-card-text>
              <div v-for="(label, attr) in metadataAttributes" :key="attr" class="py-1">
                <span class="font-weight-bold">
                  {{ label }}:
                </span> <vue-markdown>{{ dataset[attr] }}</vue-markdown>
              </div>
            </v-card-text>
          </v-layout>
        </v-container>
      </v-card>
      <v-divider />
      <v-card>
        <v-container grid-list-md fill-height fill-width>
          <v-layout column align-center justify-center>
            <v-flex xs12>
              <v-card-text>
                <div style="height: 600px; width: 600px;">
                  <l-map :zoom="dataset.region.zoom" :center="dataset.region.center" style="height: 100%">
                    <l-control-layers />
                    <l-control-scale />
                    <l-wms-tile-layer
                      base-url="http://ows.mundialis.de/services/service?"
                      layers="TOPO-OSM-WMS"
                      layer-type="base"
                      format="image/png"
                      name="Mundialis TOPO-OSM-WMS"
                      :transparent="true"
                      :overlay="false"
                      :control="false"
                    />
                    <l-wms-tile-layer
                      v-for="layer in wmsLayers"
                      :key="layer.name"
                      :base-url="skopeWmsUrl"
                      :name="layer.name"
                      :transparent="layer.transparent"
                      :layers="layer.layers"
                      :overlay="layer.overlay"
                      :format="layer.fmt"
                      :version="layer.version"
                    />
                  </l-map>
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
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Dataset from '~/components/Dataset.vue'
import VueMarkdown from 'vue-markdown'

export default {
  components: {
    Dataset,
    VueMarkdown
  },
  data() {
    return {
      metadataAttributes: {
        originator: 'Originator',
        uncertainty: 'Uncertainty',
        methodSummary: 'Method Summary',
        references: 'References'
      },
      skopeWmsUrl: 'https://app.openskope.org/geoserver/SKOPE/wms?',
      wmsLayers: [
        {
          name: 'PaleoCAR PPT',
          visible: true,
          layers: 'SKOPE:paleocar_ppt_0001-01-01',
          version: '1.3.0',
          transparent: true,
          overlay: true,
          fmt: 'image/png'
        },
        {
          name: 'PaleoCAR GDD',
          visible: true,
          transparent: true,
          version: '1.3.0',
          overlay: true,
          layers: 'SKOPE:paleocar_gdd_0001-01-01',
          fmt: 'image/png'
        }
      ]
    }
  },
  computed: {
    dataset() {
      // retrieve the dataset corresponding to the given route params id in the datastore
      // FIXME: needs error checking 404 if the dataset doesn't exist
      const id = this.$route.params.id
      return this.$store.state.datasets.list.find(dataset => dataset.id === id)
    }
  },
  created() {
    this.$store.dispatch('datasets/load')
  },
  validate({ params }) {
    return /^\w+$/.test(params.id)
  }
}
</script>

<style>
.arrow_back {
  padding-top: 40px;
}
.arrow_forward {
  bottom: 0;
  right: 0;
  padding-top: 40px;
}
.nav {
  padding-left: 400px;
  padding-bottom: 50px;
}
.stepper {
  width: 75%;
}
</style>
