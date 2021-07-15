<template>
  <v-container fluid class="fill-height">
    <v-row>
      <v-col md="12" lg="8" offset-lg="2">
        <Search />
      </v-col>
      <v-col cols="12">
        <h1 class="font-weight-light">Select a Dataset</h1>
        <template v-for="dataset in datasets" router exact>
          <v-card
            :key="dataset.absoluteUrl"
            class="pa-4 my-3"
            elevation="2"
            outlined
          >
            <Dataset
              :key="dataset.absolute_url"
              v-bind="dataset"
              class="my-2"
            />
          </v-card>
        </template>
        <v-alert v-if="datasets.length === 0" type="warning">
          No datasets found, please refine your filter criteria.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Component } from "nuxt-property-decorator";
import Vue from "vue";
import Dataset from "@/components/Dataset.vue";
import Search from "@/components/Search.vue";

@Component({
  layout: "BaseDefault",
  components: {
    Dataset,
    Search,
  },
})
class LandingPage extends Vue {
  get datasets() {
    return this.$api().datasets.filteredDatasets;
  }

  async fetch() {
    this.$api().datasets.retrieveData();
  }

  created() {
    const api = this.$api();
    api.dataset.clearTimeSeries();
    api.dataset.setMetadata(null);
  }
}
export default LandingPage;
</script>
