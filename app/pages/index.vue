<template>
  <v-container fluid class="fill-height">
    <v-row>
      <v-col md="12" lg="8" offset-lg="2">
        <Search />
      </v-col>
      <v-col cols="12">
        <h1 class="font-weight-light">
          Select a Dataset
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                depressed
                fab
                rounded
                href="https://www.openskope.org/skope-users-guide/"
                target="_blank"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon color="grey">fas fa-question-circle</v-icon>
              </v-btn>
            </template>
            <span>User Guide</span>
          </v-tooltip>
        </h1>
        <template v-for="dataset in datasets" router exact>
          <v-card
            :key="dataset.absoluteUrl"
            class="pa-4 my-3"
            elevation="0"
            outlined
          >
            <ListItem
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
