<template>
  <v-responsive :aspect-ratio="16 / 9">
    <v-row>
      <v-col class="mx-auto">
        <v-alert
          :value="instructions"
          prominent
          outlined
          text
          border="left"
          type="info"
        >
          Welcome to the Synthesizing Knowledge of Past Environments (SKOPE)
          application! To examine data, click on a dataset name, pan &amp; zoom
          the map, define your area of interest, then select a variable layer.
        </v-alert>
      </v-col>
    </v-row>
    <v-card falt outlined>
      <v-card-title class="secondary"
        >Datasets<v-icon class="mx-2">fas fa-database</v-icon></v-card-title
      >
      <v-list>
        <template v-for="(dataset, index) in datasets" router exact>
          <Dataset :key="dataset.absolute_url" v-bind="dataset" class="my-2" />
          <v-divider v-if="index < datasets.length - 1" :key="index" inset />
        </template>
      </v-list>
      <v-alert v-if="datasets.length === 0" type="info">
        No datasets found, please refine your filter criteria.
      </v-alert>
    </v-card>
  </v-responsive>
</template>

<script>
import { Component } from 'nuxt-property-decorator'
import Vue from 'vue'
import Dataset from '@/components/Dataset.vue'

@Component({
  layout: 'BaseDefault',
  components: {
    Dataset,
  },
})
class LandingPage extends Vue {
  get datasets() {
    return this.$api().datasets.filteredDatasets
  }

  get selectedDataset() {
    return this.$api().dataset
  }

  created() {
    this.$api().datasets.retrieveData()
    this.selectedDataset.clearTimeSeries()
  }
}
export default LandingPage
</script>
