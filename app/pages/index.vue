<template>
  <v-container fluid>
    <v-row dense>
      <v-col class="ma-0">
        <h1>
          Select a Dataset
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                link
                fab
                class="mt-n1 ml-n1"
                href="https://www.openskope.org/skope-users-guide/"
                target="_blank"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>fas fa-question-circle</v-icon>
              </v-btn>
            </template>
            <span>View the SKOPE user guide (opens in a new tab)</span>
          </v-tooltip>
        </h1>
      </v-col>
    </v-row>
    <Search />
    <v-row dense class="ma-0 pa-0">
      <v-col class="ma-0">
        <template v-for="dataset in datasets" router exact>
          <v-card
            :key="dataset.absoluteUrl"
            class="pa-4 my-3"
            elevation="0"
            outlined
          >
            <ListItem :key="dataset.absolute_url" v-bind="dataset" />
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
import ListItem from "@/components/dataset/ListItem.vue";
import Search from "@/components/dataset/Search.vue";
import { loadAllDatasetMetadata } from "@/store/actions";

@Component({
  layout: "DefaultLayout",
  components: {
    ListItem,
    Search,
  },
})
class LandingPage extends Vue {
  get datasets() {
    return this.$api().metadata.filteredDatasets;
  }

  async fetch() {
    console.log("Landing page: loading all dataset metadata");
    await loadAllDatasetMetadata(this.$api());
  }

  created() {
    const api = this.$api();
    api.dataset.clearTimeSeries();
    api.dataset.setMetadata(null);
  }

  mounted() {}
}
export default LandingPage;
</script>
