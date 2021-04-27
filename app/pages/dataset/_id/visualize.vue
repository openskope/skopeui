<template>
  <v-container fluid class="fill-height">
    <DatasetTitle :select-variable="true">
      <v-btn
        :disabled="!hasValidStudyArea"
        :to="analyzeLocation"
        class="float-right"
        nuxt
      >
        Go to Analyze
        <v-icon class="ml-2" small> fas fa-chevron-right </v-icon>
      </v-btn>
    </DatasetTitle>
    <v-row class="mx-1 mt-0" style="height: 100%">
      <!-- map + time series plot -->
      <v-col class="d-flex map-flex" lg="6" md="12" no-gutters>
        <Map :year="yearSelected" />
      </v-col>
      <!-- time series plot -->
      <v-col class="d-flex map-flex" lg="6" md="12">
        <TimeSeriesPlot :year-selected="yearSelected" @yearSelected="setYear" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Component } from "nuxt-property-decorator";
import Map from "@/components/Map.vue";
import TimeSeriesPlot from "@/components/TimeSeriesPlot.vue";
import DatasetTitle from "@/components/global/DatasetTitle.vue";
import Vue from "vue";
import _ from "lodash";
import { initializeDataset } from "@/store/actions";

const setYearSelected = _.debounce(function (vue) {
  vue.yearSelected = vue.formYearSelected;
}, 350);

@Component({
  layout: "BaseDataset",
  key: function (route) {
    return route.fullPath;
  },
  components: {
    DatasetTitle,
    Map,
    TimeSeriesPlot,
  },
})
class Visualize extends Vue {
  // selected year is managed by this component, when a year is selected in the time series plot
  // it generates a @yearSelected event that calls setYear here and we decide whether or not
  // to propagate it after validation etc
  yearSelected = 1500;
  layerGroup = {
    icon: "fas fa-layer-group",
  };
  stepNames = _.clone(this.$api().app.stepNames);

  get geometry() {
    return this.$api().dataset.geoJson?.geometry ?? null;
  }

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get timespan() {
    return this.$api().dataset.timespan;
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep === 0 || this.$api().dataset.hasGeoJson;
  }

  get minYear() {
    return parseInt(this.metadata.timespan.period.gte);
  }

  get maxYear() {
    return parseInt(this.metadata.timespan.period.lte);
  }

  get variable() {
    return this.$api().dataset.variable;
  }

  set variable(id) {
    this.$api().dataset.setVariable(id);
  }

  get variables() {
    return this.metadata.variables;
  }

  get analyzeLocation() {
    return {
      name: "dataset-id-analyze",
      params: { id: this.$route.params.id },
    };
  }

  async fetch() {
    const datasetId = this.$route.params.id;
    initializeDataset(this.$warehouse, this.$api(), datasetId);
  }

  async mounted() {
    this.yearSelected = this.minYear;
  }

  setYear(year) {
    this.yearSelected = year;
  }
}

export default Visualize;
</script>

<style scoped>
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
