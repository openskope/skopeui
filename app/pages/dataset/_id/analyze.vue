<template>
  <v-container fluid class="fill-height">
    <DatasetTitle :select-variable="true" />
    <v-row class="mx-1 mt-0" style="height: 100%">
      <!-- time series -->
      <v-col no-gutters class="d-flex timeseries-flex" lg="8" md="12">
        <TimeSeriesPlot
          :show-step-controls="false"
          :show-area="true"
          :time-series="timeSeries"
        />
      </v-col>
      <!-- analysis form -->
      <v-col
        no-gutters
        class="d-flex timeseries-flex"
        lg="4"
        md="12"
        style="background-color: #f4f7ff"
      >
        <v-form style="height: 100%; width: 100%">
          <!-- /////////// STATS FOR TEMPORAL INTERVAL /////////// -->
          <h1 class="font-weight-light">
            Statistics for the Temporal Interval
          </h1>
          <v-data-table
            :disable-pagination="true"
            :disable-filtering="true"
            :disable-sort="true"
            :hide-default-footer="true"
            :headers="statisticsHeaders"
            :items="summaryStatistics"
            class="my-3"
          >
            <template #append-outer>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-icon v-on="on"> fas fa-question-circle </v-icon>
                </template>
                I'm a tooltip
              </v-tooltip>
            </template>
          </v-data-table>
          <!-- /////////// YEAR STEP SELECTION /////////// -->
          <v-select
            v-if="isStudyAreaPolygon"
            v-model="zonalStatistic"
            :items="zonalStatisticOptions"
            label="For each time step, summarize selected area as"
            item-text="label"
            item-value="id"
            color="primary"
          >
            <template #append-outer>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-icon v-on="on"> fas fa-question-circle </v-icon>
                </template>
                I'm a tooltip
              </v-tooltip>
            </template>
          </v-select>
          <v-alert v-else type="info">
            Summary statistics are not available for a point geometry.
          </v-alert>
          <h2 class="subtitle">Smoothing</h2>
          <v-select
            v-model="smoothingOption"
            label="Smoothing options"
            item-color="info"
            color="primary"
            :items="smoothingOptions"
            item-text="label"
            item-value="id"
          >
            <template #append-outer>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-icon v-on="on"> fas fa-question-circle </v-icon>
                </template>
                I'm a tooltip
              </v-tooltip>
            </template>
          </v-select>
          <v-text-field
            v-if="hasSmoothingOption"
            v-model="smoothingTimeStep"
            label="Smoothing window"
            suffix="time steps"
            type="number"
            clearable
          >
            <template #append-outer>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-icon v-on="on"> fas fa-question-circle </v-icon>
                </template>
                I'm a tooltip
              </v-tooltip>
            </template>
          </v-text-field>
          <!-- /////////// DISPLAY OPTIONS /////////// -->
          <h2 class="subtitle">Display</h2>
          <v-select
            v-model="displayOption"
            label="Display options"
            item-color="secondary"
            color="secondary"
            dense
            :items="displayOptions"
            item-text="label"
            item-value="id"
            class="my-4"
          >
            <template #append-outer>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-icon v-on="on"> fas fa-question-circle </v-icon>
                </template>
                I'm a tooltip
              </v-tooltip>
            </template>
          </v-select>
          <template v-if="displayOption !== 'none'">
            <v-row
              v-if="displayOption === 'zscoreFixed'"
              align="baseline"
              justify="start"
              no-gutters
              class="mt-5"
            >
              <v-col class="mr-5">
                <v-text-field
                  v-model="timeRange.lb.year"
                  label="Year (Lower Bound)"
                  dense
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="timeRange.ub.year"
                  label="Year (Upper Bound)"
                  dense
                  type="number"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              v-if="displayOption === 'zscoreMoving'"
              v-model="zScoreMovingIntervalTimeSteps"
              label="Transform window"
              outlined
              dense
              type="number"
              suffix="years"
            >
              <template #append-outer>
                <v-tooltip bottom>
                  <template #activator="{ on }">
                    <v-icon v-on="on"> fas fa-question-circle </v-icon>
                  </template>
                  I'm a tooltip
                </v-tooltip>
              </template>
            </v-text-field>
          </template>
          <v-btn
            class="font-weight-bold"
            color="accent"
            block
            @click="updateTimeSeries"
            >Update <v-icon small class="mx-2">update</v-icon></v-btn
          >
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import KernelRegression from "@/components/chart-form/KernelRegression.vue";
import RunningAverage from "@/components/chart-form/RunningAverage.vue";
import TimeSeriesPlot from "@/components/TimeSeriesPlot.vue";
import DatasetTitle from "@/components/global/DatasetTitle.vue";
import Vue from "vue";
import { Component } from "nuxt-property-decorator";
import {
  loadTimeSeries,
  retrieveTimeSeries,
  initializeDataset,
} from "@/store/actions";
import _ from "lodash";

@Component({
  layout: "BaseDataset",
  components: {
    KernelRegression,
    RunningAverage,
    TimeSeriesPlot,
    DatasetTitle,
  },
})
class Analyze extends Vue {
  dialog = false;
  instructions = false;
  smoothing = null;
  display = null;
  timeSeriesUnWatcher = null;
  yearSelected = 1500;
  zScoreMovingIntervalTimeSteps = 25;

  layerGroup = {
    icon: "fas fa-layer-group",
  };

  polygon = {
    icon: "fas fa-draw-polygon",
  };

  zonalStatistic = "mean";

  zonalStatisticOptions = [
    {
      label: "Mean of its pixels",
      id: "mean",
    },
    {
      label: "Median of its pixels",
      id: "median",
    },
  ];

  timeRange = {
    lb: {
      year: 1500,
      month: 1,
    },
    ub: {
      year: 1800,
      month: 1,
    },
  };

  smoothingOption = "none";

  smoothingOptions = [
    {
      label: "None (time steps individually plotted)",
      id: "none",
    },
    {
      label: "Centered Running Average (+/- window width)",
      id: "centeredAverage",
    },
    {
      label: "Trailing Running Average (- window width)",
      id: "trailingAverage",
    },
  ];

  smoothingTimeStep = 7;

  displayOption = "none";

  displayOptions = [
    {
      label: "Modeled values",
      id: "none",
    },
    {
      label:
        "Z-Score wrt Fixed Interval (Z calculated using Mean and S.D. above)",
      id: "zscoreFixed",
    },
    {
      label: "Z-Score wrt Moving Interval (Z recalculated on moving basis)",
      id: "zscoreMoving",
    },
  ];

  summaryStatistics = [
    {
      series: "Base",
      mean: this.mean,
      median: this.median,
      stdDev: this.stdDev,
    },
    {
      series: "Transform",
      mean: "transformed mean",
      median: "transformed median",
      stdDev: "transformed stddev",
    },
  ];

  statisticsHeaders = [
    {
      text: "Series",
      align: "start",
      value: "series",
      class: "title",
    },
    {
      text: "Mean",
      value: "mean",
      class: "title",
    },
    {
      text: "Median",
      value: "median",
      class: "title",
    },
    {
      text: "Standard Deviation",
      value: "stdDev",
      class: "title",
    },
  ];

  get hasSmoothingOption() {
    return this.smoothingOption !== "none";
  }

  get response() {
    return this.$api().analyze.response;
  }

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get mean() {
    return this.$api().dataset.mean;
  }

  get median() {
    return this.$api().dataset.median;
  }

  get stdDev() {
    return this.$api().dataset.stdDev;
  }

  get temporalRange() {
    return this.$api().dataset.temporalRange;
  }

  get studyAreaGeometry() {
    return this.$api().dataset.geoJson.geometry;
  }

  get isStudyAreaPolygon() {
    return this.studyAreaGeometry.type !== "Point";
  }

  get canHandleTimeSeriesRequest() {
    return this.$api().dataset.canHandleTimeSeriesRequest;
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

  get smootherWidthLabel() {
    let widthUnit = "Unknowns";
    switch (this.temporalResolution) {
      case "month":
        widthUnit = "Months";
        break;
      case "year":
        widthUnit = "Years";
        break;
    }
    return `Smoother Width (# of ${widthUnit})`;
  }

  get temporalResolution() {
    return this.metadata.timespan.resolution;
  }

  get timeSeries() {
    const timeseries = this.$api().dataset.timeseries;
    if (timeseries.x.length > 0) {
      return { ...this.$api().dataset.timeseries, type: "scatter" };
    } else {
      return { x: [], y: [], type: "scatter" };
    }
  }

  get minYear() {
    return parseInt(this.metadata.timespan.period.gte);
  }

  get maxYear() {
    return parseInt(this.metadata.timespan.period.lte);
  }

  setYear(year) {
    this.yearSelected = year;
  }

  async updateTimeSeries() {
    console.log("submitting to web service");
    const datasetApi = this.$api().dataset;
    const query = {
      dataset_id: datasetApi.metadata.id,
      variable_id: datasetApi.variable.id,
      selected_area: this.studyAreaGeometry,
      zonal_statistic: this.zonalStatistic,
      transforms: [],
      time_range: {
        gte: this.temporalRange[0],
        lte: this.temporalRange[1],
      },
    };
    await this.$api().analyze.retrieveAnalysis(query);
  }

  created() {
    initializeDataset(this.$warehouse, this.$api(), this.$route.params.id);
    console.log("analyze initializing dataset: ", this.id);
  }

  async updated() {
    console.log("updated - variable: ", this.variable);
  }

  async mounted() {
    const api = this.$api();
    // load default variable
    api.dataset.loadDefaultVariable(this.$route.params.id);
    await loadTimeSeries(this.$api());
    this.timeSeriesUnWatcher = this.$watch(
      function () {
        if (this.canHandleTimeSeriesRequest) {
          return {
            datasetId: this.metadata.id,
            variableId: this.variable.id,
            geometry: this.studyAreaGeometry,
            minYear: this.minYear,
            maxYear: this.maxYear,
          };
        } else {
          return {
            datasetId: null,
            variableId: null,
            geometry: null,
            minYear: null,
            maxYear: null,
          };
        }
      },
      async function (data) {
        console.log({ data });
        await retrieveTimeSeries(api, data);
      }
    );
    this.yearSelected = this.timeRange.lb.year;
  }

  destroyed() {
    if (this.timeSeriesUnWatcher !== null) {
      this.timeSeriesUnWatcher();
    }
  }
}
export default Analyze;
</script>

<style scoped>
.timeseries-flex {
  height: calc(85vh - 96px);
}
@media all and (max-width: 960px) {
  .timeseries-flex {
    height: 400px;
  }
}
@media all and (max-width: 600px) {
  .timeseries-flex {
    height: 350px;
  }
}

.title {
  color: #596d7b;
  font-weight: light;
}

.subtitle {
  color: #596d7b;
  font-size: 1.5rem;
}
</style>
