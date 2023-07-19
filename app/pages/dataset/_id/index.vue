<template>
  <v-container fluid class="fill-height">
    <LoadingSpinner v-if="isLoadingMetadata"></LoadingSpinner>
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
                <v-btn outlined color="accent" @click="clearGeometry">
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

import { initializeDataset, saveGeoJson, clearGeoJson } from "@/store/actions";

function getBody(request) {
  const qs = require("querystring");
  return new Promise((resolve) => {
    const bodyArray = [];
    let body;
    request
      .on("data", (chunk) => {
        bodyArray.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(bodyArray).toString();
        resolve(qs.parse(body));
      });
  });
}

@Component({
  layout: "DefaultLayout",
  components: {
    LoadingSpinner,
    SubHeader,
    Map,
  },
})
class SelectDatasetArea extends Vue {
  shouldConfirmGeometry = true;
  formPostGeoJson = "";

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

  get isLoadingMetadata() {
    return this.metadata == null;
  }

  get stepNames() {
    return this.$api().app.stepNames;
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

  mounted() {
    console.log("MOUNTED");
    if (this.formPostGeoJson) {
      console.log("form post geojson: ", this.formPostGeoJson);
      this.shouldConfirmGeometry = false;
      saveGeoJson(this.$warehouse, this.$api(), this.formPostGeoJson);
    }
  }

  head() {
    if (this.metadata) {
      return {
        title: this.metadata.title,
        meta: [
          {
            hid: "description",
            name: "description",
            content: this.metadata.description,
          },
        ],
      };
    }
  }

  async asyncData({ req, res }) {
    if (process.server) {
      if (req.method === "POST") {
        const postData = await getBody(req);
        console.log("Received POST data: ", postData);
        if (postData) {
          try {
            const studyAreaGeoJson = JSON.parse(postData.studyArea);
            return { formPostGeoJson: studyAreaGeoJson };
          } catch (e) {
            console.log("error parsing geojson: ", e);
          }
        }
        let body = "";
        let chunk = "";
      } else {
        console.log("not a post request");
      }
    }
  }

  validate({ params }) {
    return /^\w+$/.test(params.id);
  }

  clearGeometry() {
    this.shouldConfirmGeometry = false;
    this.$api().app.setVisited();
    clearGeoJson(this.$warehouse, this.$api());
  }

  mapLoaded(value) {
    console.log("map loaded, form post geojson: ", this.formPostGeoJson);
    if (this.formPostGeoJson) {
      this.shouldConfirmGeometry = false;
      saveGeoJson(this.$warehouse, this.$api(), this.formPostGeoJson);
    } else {
      this.shouldConfirmGeometry = this.hasValidStudyArea;
    }
  }

  keepGeometry() {
    this.shouldConfirmGeometry = false;
    this.$api().app.setVisited();
  }
}
export default SelectDatasetArea;
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
