<template>
  <v-row justify-center>
    <v-col xs12 sm8 md6>
      <v-card>
        <v-responsive :aspect-ratio="16 / 9">
          <v-card-title>
            <v-icon left> fas fa-database </v-icon>
            <span class="headline"> Datasets </span>
          </v-card-title>
          <v-card-text class="title text--primary">
            Welcome to the Synthesizing Knowledge of Past Environments (SKOPE)
            application! To examine data, click on a dataset name, pan &amp;
            zoom the map, define your area of interest, then select a variable
            layer.
          </v-card-text>
          <v-list>
            <template v-for="(dataset, index) in datasets" router exact>
              <Dataset :key="dataset.absolute_url" v-bind="dataset" />
              <v-divider
                v-if="index < datasets.length - 1"
                :key="index"
                inset
              />
            </template>
          </v-list>
          <v-alert v-if="datasets.length === 0" type="info">
            No datasets found, please refine your filter criteria.
          </v-alert>
        </v-responsive>
      </v-card>
    </v-col>
  </v-row>
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
