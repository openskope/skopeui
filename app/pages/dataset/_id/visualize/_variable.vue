<template>
  <v-container fluid class="fill-height align-start">
    <v-row no-gutters>
      <v-col class="pa-0 ma-0">
        <SubHeader :select-variable="true">
          <v-btn
            :disabled="!hasValidStudyArea"
            :to="analyzeLocation"
            nuxt
            color="accent"
            depressed
          >
            Analyze Data
            <v-icon class="ml-2" small> fas fa-chevron-right </v-icon>
          </v-btn>
        </SubHeader>
      </v-col>
    </v-row>
    <v-row class="pa-0 mb-6" no-gutters>
      <!-- 2 column layout with map and time series-->
      <v-col
        class="d-flex map-flex pa-0 mb-3"
        lg="6"
        md="12"
        sm="12"
        align-self="stretch"
      >
        <Map :year="yearSelected" />
      </v-col>
      <!-- time series plot -->
      <v-col
        class="d-flex map-flex pa-0"
        lg="6"
        md="12"
        sm="12"
        align-self="stretch"
      >
        <TimeSeriesPlot
          :traces="traces"
          :year-selected="yearSelected"
          @yearSelected="setYear"
          @selectedTemporalRange="updateTimeSeries"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Component } from "nuxt-property-decorator";
import Map from "@/components/dataset/Map.vue";
import TimeSeriesPlot from "@/components/dataset/TimeSeriesPlot.vue";
import SubHeader from "@/components/dataset/SubHeader.vue";
import Vue from "vue";
import _ from "lodash";
import { initializeDataset, loadRequestData } from "@/store/actions";
import { toISODate } from "@/store/stats";

const setYearSelected = _.debounce(function (vue) {
  vue.yearSelected = vue.formYearSelected;
}, 350);

@Component({
  layout: "DefaultLayout",
  key: function (route) {
    return route.fullPath;
  },
  components: {
    SubHeader,
    Map,
    TimeSeriesPlot,
  },
})
class Visualize extends Vue {
  // yearSelected state is managed by this component.
  // when a year is selected in the time series plot
  // it generates a @yearSelected event that calls setYear here which
  // propagates back down to the map and time series plot components
  yearSelected = 1500;
  stepNames = _.clone(this.$api().app.stepNames);

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }

  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep === 0 || this.$api().dataset.hasGeoJson;
  }

  get analyzeLocation() {
    const id = this.$route.params.id;
    const variable = this.$route.params.variable;
    return {
      name: "dataset-id-analyze-variable",
      params: { id, variable },
    };
  }

  get temporalRange() {
    return this.$api().dataset.temporalRange;
  }

  get traces() {
    return [{ ...this.$api().dataset.filteredTimeSeries, type: "scatter" }];
  }

  async fetch() {
    const datasetId = this.$route.params.id;
    const variableId = this.$route.params.variable;
    const api = this.$api();
    await initializeDataset(this.$warehouse, api, datasetId, variableId);
  }

  async mounted() {
    const api = this.$api();
    await loadRequestData(api);
    this.setYear(api.dataset.temporalRangeMin);
    this.$api().app.setVisited();
  }

  setYear(year) {
    this.yearSelected = year;
  }

  updateTimeSeries() {
    const api = this.$api();
    console.log("submitting to web service");
    const requestData = {
      ...api.dataset.defaultApiRequestData,
      // override time range with values from temporal range
      time_range: {
        gte: toISODate(this.temporalRange[0]),
        lte: toISODate(this.temporalRange[1]),
      },
    };
    api.analysis.setRequestData(requestData);
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
    height: 450px;
  }
}

@media all and (max-width: 600px) {
  .map-flex {
    height: 450px;
  }
}
</style>
