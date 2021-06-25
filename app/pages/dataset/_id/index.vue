<template>
  <v-container fluid class="fill-height">
    <v-row>
      <LoadingSpinner v-if="isLoading"></LoadingSpinner>
      <v-col lg="12" md="12" sm="12" class="mb-3">
        <DatasetTitle>
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
        </DatasetTitle>
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
                <v-card-actions class="justify-end">
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

import LoadingSpinner from "@/components/global/LoadingSpinner.vue";
import DatasetTitle from "@/components/global/DatasetTitle.vue";
import Map from "@/components/Map.vue";

import { initializeDataset, clearGeoJson } from "@/store/actions";

const fillTemplate = require("es6-dynamic-template");

@Component({
  layout: "BaseDataset",
  components: {
    // load time series plotly component lazily to avoid document is not defined errors
    // https://stackoverflow.com/a/50458090
    LoadingSpinner,
    DatasetTitle,
    Map,
  },
})
class DatasetDetail extends Vue {
  stepNames = _.clone(this.$api().app.stepNames);
  dialog = false;
  confirmGeometry = false;

  get isLoading() {
    return this.metadata == null;
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get timespan() {
    return this.$api().dataset.timespan;
  }

  get timeZero() {
    return this.$api().dataset.timeZero;
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep === 0 || this.$api().dataset.hasGeoJson;
  }

  get selectedArea() {
    return (this.$api().dataset.selectedAreaInSquareMeters / 1000000.0).toFixed(
      2
    );
  }

  async fetch() {
    const datasetId = this.$route.params.id;
    const variableId = this.$route.params.variable;
    initializeDataset(this.$warehouse, this.$api(), datasetId, variableId);
    this.confirmGeometry = this.hasValidStudyArea;
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
    this.confirmGeometry = false;
    clearGeoJson(this.$warehouse, this.$api());
  }
}
export default DatasetDetail;
</script>
<style>
.leaflet-top.leaflet-right,
.leaflet-control-layers:nth-child(2),
.leaflet-control-layers-toggle {
  background-image: url(/earth.svg);
}

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

ul.leaflet-draw-actions.leaflet-draw-actions-bottom li a[title="Save changes"] {
  display: none;
}
</style>
