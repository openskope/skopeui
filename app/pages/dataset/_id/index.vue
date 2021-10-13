<template>
  <v-container fluid class="fill-height">
    <v-row>
      <LoadingSpinner v-if="isLoading"></LoadingSpinner>
      <v-col lg="12" md="12" sm="12" class="mb-3">
        <SubHeader>
          <v-btn
            :disabled="!hasValidStudyArea"
            :to="visualizeLocation"
            nuxt
            color="accent"
            depressed
          >
            Visualize Data
            <v-icon small class="ml-2"> fas fa-chevron-right </v-icon>
          </v-btn>
        </SubHeader>
      </v-col>
      <v-col
        lg="12"
        md="12"
        sm="12"
        class="d-flex map-flex"
        align-self="stretch"
      >
        <Map :display-raster="false" class="mx-auto"></Map>
      </v-col>
      <v-col>
        <client-only>
          <v-dialog
            v-model="confirmGeometry"
            transition="dialog-bottom-transition"
            max-width="600"
          >
            <template #default="confirmGeometry">
              <v-card class="pa-6">
                <v-card-text>
                  <h3>
                    Welcome back! Would you like to clear the currently selected
                    area?
                  </h3>
                </v-card-text>
                <v-card-actions class="justify-space-between">
                  <v-btn outlined color="accent" @click="clearGeoJson">
                    Clear selected area
                  </v-btn>
                  <v-btn
                    depressed
                    color="accent"
                    @click="confirmGeometry.value = false"
                  >
                    Keep selected area
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </client-only>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _ from "lodash";
import { Component } from "nuxt-property-decorator";
import Vue from "vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import SubHeader from "@/components/dataset/SubHeader.vue";
import Map from "@/components/dataset/Map.vue";

import { initializeDataset, clearGeoJson } from "@/store/actions";

const fillTemplate = require("es6-dynamic-template");

@Component({
  layout: "DefaultLayout",
  components: {
    LoadingSpinner,
    SubHeader,
    Map,
  },
})
class DatasetDetail extends Vue {
  stepNames = _.clone(this.$api().app.stepNames);
  shouldConfirmGeometry = true;

  get confirmGeometry() {
    return this.hasValidStudyArea && this.shouldConfirmGeometry;
  }

  set confirmGeometry(value) {
    this.shouldConfirmGeometry = value;
  }

  get isLoading() {
    return this.metadata == null;
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.$api().dataset.hasGeoJson;
  }

  get selectedArea() {
    return (this.$api().dataset.selectedAreaInSquareMeters / 1000000.0).toFixed(
      2
    );
  }

  fetch() {
    const params = this.$route.params;
    console.log(
      "fetch: loading dataset and variable from params: ",
      params
    );
    const datasetId = params.id;
    const variableId = params.variable;
    initializeDataset(this.$warehouse, this.$api(), datasetId, variableId);
  }

  head() {
    return {
      title: this.metadata?.title ?? "Select Area",
    };
  }

  validate({ params }) {
    return /^\w+$/.test(params.id);
  }

  get visualizeLocation() {
    const id = this.$route.params.id;
    const variable = this.$api().dataset.variable.id;
    return { name: "dataset-id-visualize-variable", params: { id, variable } };
  }

  clearGeoJson() {
    clearGeoJson(this.$warehouse, this.$api());
  }
}
export default DatasetDetail;
</script>
<style>
.map-flex {
  height: calc(85vh - 96px);
}

@media all and (max-width: 960px) {
  .map-flex {
    height: 400px;
  }
}

@media all and (max-width: 600px) {
  .map-flex {
    height: 350px;
  }
}
</style>
