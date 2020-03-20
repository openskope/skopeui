<template>
  <v-layout column justify-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-responsive :aspect-ratio="16 / 9">
          <v-card-title>
            <v-icon left>
              sd_card
            </v-icon>
            <span class="headline">
              Datasets
            </span>
          </v-card-title>
          <v-card-text>
            <div class="title text--primary">
              Welcome to the SKOPE Application! To obtain data, click on a
              dataset name, pan &amp; zoom the map, define your area of
              interest, and select a variable layer.
            </div>
          </v-card-text>
          <v-list>
            <template v-for="(dataset, index) in datasets" router exact>
              <Dataset :key="dataset.absolute_url" v-bind="dataset" />
              <v-divider :key="index" inset />
            </template>
          </v-list>
        </v-responsive>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import Dataset from '~/components/Dataset.vue'

export default {
  components: {
    Dataset
  },
  computed: {
    ...mapGetters({
      datasets: 'datasets/filteredDatasets'
    })
  },
  created() {
    this.$store.dispatch('datasets/load')
  }
}
</script>
