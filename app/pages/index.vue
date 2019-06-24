<template>
  <v-layout column justify-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-responsive :aspect-ratio="16 / 9">
          <v-card-title>
            <v-icon left>
              sd_card
            </v-icon>
            <span class="title">
              Datasets
            </span>
          </v-card-title>
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
