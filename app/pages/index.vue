<template>
  <v-container fluid class="fill-height">
    <v-snackbar
      v-model="showSnack"
      color="secondary darken-2"
      text
      right
      outlined
      timeout="10000"
    >
      <p style="font-size: 1.45rem">
        Welcome to the Synthesizing Knowledge of Past Environments (SKOPE)
        application! Filter datasets then select a dataset to examine.
      </p>
      <template #action="{ attrs }">
        <v-btn
          color="secondary darken-3"
          v-bind="attrs"
          @click="showSnack = false"
        >
          OK
        </v-btn>
      </template>
    </v-snackbar>
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
  showSnack = false;

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

  mounted() {
    this.showSnack = true;
  }
}
export default LandingPage;
</script>
