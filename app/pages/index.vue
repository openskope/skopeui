<template>
  <v-responsive :aspect-ratio="16 / 9">
    <v-row>
      <v-col class="mx-auto">
        <v-alert color="secondary" type="info" text outlined>
          Welcome to the Synthesizing Knowledge of Past Environments (SKOPE)
          application! To examine data, click on a dataset name, pan &amp; zoom
          the map, define your area of interest, then select a variable layer.
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="mx-auto">
        <h1 class="font-weight-light">
          <v-icon class="mx-2 my-auto">fas fa-database</v-icon>
          Datasets
        </h1>
        <template v-for="dataset in datasets" router exact>
          <v-card
            :key="dataset.absoluteUrl"
            class="pa-4 my-3"
            elevation="2"
            outlined
            shaped
          >
            <Dataset
              :key="dataset.absolute_url"
              v-bind="dataset"
              class="my-2"
            />
          </v-card>
        </template>
        <v-alert v-if="datasets.length === 0" type="info">
          No datasets found, please refine your filter criteria.
        </v-alert>
      </v-col>
    </v-row>
  </v-responsive>
</template>

<script>
import { Component } from 'nuxt-property-decorator';
import Vue from 'vue';
import Dataset from '@/components/Dataset.vue';

@Component({
  layout: 'BaseDefault',
  components: {
    Dataset,
  },
})
class LandingPage extends Vue {
  get datasets() {
    return this.$api().datasets.filteredDatasets;
  }

  created() {
    const api = this.$api();
    api.datasets.retrieveData();
    api.dataset.clearTimeSeries();
    api.dataset.setMetadata(null);
  }
}
export default LandingPage;
</script>
