<template>
  <v-responsive height="100%" width="100%">
    <LoadingSpinner v-if="isLoading" />
    <template v-else>
      <v-row class="d-flex flex-column" style="height: 100%">
        <!-- title -->
        <v-col
          class="d-flex flex-row flex-grow-0 flex-shrink-1 ma-0 px-10 pb-0 pt-10"
        >
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
                      Welcome back! Would you like to clear the currently
                      selected area?
                    </h3>
                  </v-card-text>
                  <v-card-actions class="justify-end">
                    <v-btn
                      depressed
                      color="info"
                      @click="confirmGeometry.value = false"
                    >
                      Keep selected area
                    </v-btn>
                    <v-btn depressed color="warning" @click="clearGeoJson">
                      Clear selected area
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </client-only>
          <DatasetTitle>
            <v-btn :disabled="!hasValidStudyArea" :to="visualizeLocation" nuxt>
              Go to Visualize
              <v-icon small class="ml-2" color="white">
                fas fa-chevron-right
              </v-icon>
            </v-btn>
          </DatasetTitle>
        </v-col>
        <!-- instructions -->
        <v-col class="flex-grow-0 flex-shrink-1 ma-0 px-10 pb-0">
          <v-alert
            v-model="instructions"
            color="secondary"
            type="info"
            text
            outlined
            dismissible
          >
            Select the geometry for the dataset by using the drawing tools on
            the map. A geometry must be defined in order to visualize and
            analyze the dataset.
          </v-alert>
        </v-col>
        <!-- map -->
        <v-col id="map-flex" class="flex-grow-1 flex-shrink-0 ma-0 px-10">
          <Map :display-raster="false" class="mx-auto" />
        </v-col>
      </v-row>
    </template>
  </v-responsive>
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
  instructions = false;
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
    initializeDataset(this.$warehouse, this.$api(), datasetId);
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
    return { name: "dataset-id-visualize", params: { id } };
  }

  clearGeoJson() {
    this.confirmGeometry = false;
    clearGeoJson(this.$warehouse, this.$api());
  }
}
export default DatasetDetail;
</script>
<style>
.leaflet-top.leaflet-right
  .leaflet-control-layers:nth-child(2)
  .leaflet-control-layers-toggle {
  background-image: url(/earth.svg);
}

#exportSelectedGeometry {
  text-decoration: none;
  color: inherit;
}

@media all and (max-width: 960px) {
  #map-flex {
    height: 400px;
  }
}

@media all and (max-width: 600px) {
  #map-flex {
    height: 350px;
  }
}

.map {
  height: 100%;
  position: relative;
  z-index: 1;
}

.header {
  color: white;
}

ul.leaflet-draw-actions.leaflet-draw-actions-bottom li a[title="Save changes"] {
  display: none;
}
</style>
