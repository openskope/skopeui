<template>
  <v-layout row>
    <v-flex md12>
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
        <v-card-text>
          <div style="height: 400px">
            <l-map :zoom="dataset.region.zoom" :center="dataset.region.center" style="height: 100%">
              <l-control-layers />
              <l-control-scale />
              <l-wms-tile-layer
                v-for="layer in layers"
                :key="layer.name"
                :base-url="baseUrl"
                :name="layer.name"
                layer-type="base"
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
      </v-card>
    </v-flex>
  </v-layout>
  </v-card-actions>
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
