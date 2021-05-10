<template>
  <v-container fluid class="fill-height align-start">
    <v-row no-gutters>
      <v-col lg="12" md="12" class="mb-3">
        <DatasetTitle :select-variable="true">
          <v-spacer></v-spacer>
          <v-btn :disabled="!hasValidStudyArea" :to="analyzeLocation" nuxt>
            Go to Analyze
            <v-icon class="ml-2" small> fas fa-chevron-right </v-icon>
          </v-btn>
        </DatasetTitle>
      </v-col>
      <!-- 2 column layout with map and time series-->
      <v-col
        class="d-flex map-flex mb-3 px-2"
        lg="6"
        md="12"
        align-self="stretch"
      >
        <Map :year="yearSelected" />
      </v-col>
      <!-- time series plot -->
      <v-col class="d-flex map-flex px-2" lg="6" md="12" align-self="stretch">
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
  // yearSelected state is managed by this component.
  // when a year is selected in the time series plot
  // it generates a @yearSelected event that calls setYear here which
  // propagates back down to the map and time series plot components
  yearSelected = 1500;
  layerGroup = {
    icon: "fas fa-layer-group",
  };
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

  created() {
    const datasetId = this.$route.params.id;
    const variableId = this.$route.params.variable;
    initializeDataset(this.$warehouse, this.$api(), datasetId, variableId);
  }

  async mounted() {
    this.setYear(this.$api().dataset.temporalRangeMin);
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
