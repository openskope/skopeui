<template>
  <v-container fluid class="fill-height">
    <LoadingSpinner v-if="isLoading"></LoadingSpinner>
    <template v-else>
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
      <v-row dense>
        <v-col cols="12" class="d-flex map-flex">
          <Map
            :display-raster="false"
            class="mx-auto"
            @mapReady="mapLoaded"
          ></Map>
        </v-col>
        <client-only>
          <v-dialog
            v-model="confirmGeometry"
            transition="dialog-bottom-transition"
            max-width="600"
          >
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
                <v-btn depressed color="accent" @click="keepGeometry">
                  Keep selected area
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </client-only>
      </v-row>
    </template>
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
    return (
      this.hasValidStudyArea && this.shouldConfirmGeometry && this.isFirstVisit
    );
  }

  get isFirstVisit() {
    return this.$api().app.isFirstVisit;
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

  get visualizeLocation() {
    const id = this.$route.params.id;
    const variable = this.$api().dataset.variable.id;
    return { name: "dataset-id-visualize-variable", params: { id, variable } };
  }

  async fetch() {
    const params = this.$route.params;
    const datasetId = params.id;
    const variableId = params.variable;
    await initializeDataset(
      this.$warehouse,
      this.$api(),
      datasetId,
      variableId
    );
  }

  head() {
    return {
      title: this.metadata?.title ?? "Select Area",
    };
  }

  validate({ params }) {
    return /^\w+$/.test(params.id);
  }

  clearGeoJson() {
    clearGeoJson(this.$warehouse, this.$api());
  }

  mapLoaded(value) {
    this.shouldConfirmGeometry = this.hasValidStudyArea;
  }

  keepGeometry() {
    this.shouldConfirmGeometry = false;
    console.log("setting visited");
    this.$api().app.setVisited();
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
