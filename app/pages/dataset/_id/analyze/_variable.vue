<template>
  <v-container fluid class="fill-height">
    <DatasetTitle :select-variable="true" />
    <v-row class="mx-1 mt-0 grow">
      <!-- time series -->
      <v-col
        class="d-flex timeseries-flex py-0"
        lg="8"
        md="12"
        align-self="stretch"
      >
        <TimeSeriesPlot
          :show-step-controls="false"
          :show-area="true"
          :display-transformed-time-series="true"
        />
      </v-col>
      <!-- analysis form -->
      <v-col
        class="d-flex timeseries-flex"
        lg="4"
        md="12"
        style="background-color: #f4f7ff"
        align-self="stretch"
      >
        <v-form style="width: 100%">
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
          </v-data-table>
          <!-- /////////// YEAR STEP SELECTION /////////// -->
          <h2 class="subtitle">Zonal Statistic</h2>
          <v-alert
            v-if="isStudyAreaPolygon"
            v-model="showZonalStatisticHint"
            border="top"
            colored-border
            icon="fas fa-question-circle"
            color="secondary"
            elevation="2"
            dismissible
          >
            At each time step, the value used for the selected area is the
            summary value (mean by default) of all selected pixels.
          </v-alert>
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
              <v-btn
                icon
                @click="showZonalStatisticHint = !showZonalStatisticHint"
              >
                <v-icon color="secondary"> fas fa-question-circle </v-icon>
              </v-btn>
            </template>
          </v-select>
          <v-alert v-else type="secondary">
            Summary statistics are not available for a point geometry.
          </v-alert>
          <h2 class="subtitle">Smoothing</h2>
          <v-alert
            v-model="showSmoothingHint"
            border="top"
            colored-border
            icon="fas fa-question-circle"
            color="secondary"
            elevation="2"
            dismissible
          >
            <span v-if="smoothingOption == 'centeredAverage'">
              If window width is n, the graphed value for a given year is the
              {{ zonalStatistic }} the 2n+1 time step summary values for the
              selected area centered on that year.
            </span>
            <span v-else-if="smoothingOption === 'trailingAverage'">
              If the window width entered is n, the graphed value for a year is
              the {{ zonalStatistic }} of the n time step summary values for the
              current year and the n-1 preceding years
            </span>
            <span v-else>
              No smoothing the summary values for a given year are graphed.
            </span>
          </v-alert>
          <v-select
            v-model="smoothingOption"
            label="Smoothing options"
            item-color="secondary"
            color="primary"
            :items="smoothingOptions"
            item-text="label"
            item-value="id"
          >
            <template #append-outer>
              <v-btn icon @click="showSmoothingHint = !showSmoothingHint">
                <v-icon color="secondary"> fas fa-question-circle </v-icon>
              </v-btn>
            </template>
          </v-select>
          <v-text-field
            v-if="hasSmoothingOption"
            v-model="smoothingTimeStep"
            label="Smoothing window"
            suffix="time steps"
            type="number"
          >
          </v-text-field>
          <!-- /////////// TRANSFORMATION OPTIONS /////////// -->
          <h2 class="subtitle">Transformation</h2>
          <v-alert
            v-model="showTransformHint"
            border="top"
            colored-border
            icon="fas fa-question-circle"
            color="secondary"
            elevation="2"
            dismissible
          >
            <span v-if="transformOption === 'zscoreFixed'">
              Displays Z-score transformed values relative to a fixed interval
              selected by the user.
            </span>
            <span v-else-if="transformOption === 'zscoreMoving'">
              Displays Z-score transformed values relative to a moving window of
              a size (n time steps) selected by the user.
            </span>
            <span v-else
              >Modeled values are graphed without any transformation.</span
            >
          </v-alert>
          <v-select
            v-model="transformOption"
            label="Transformation options"
            item-color="secondary"
            color="secondary"
            dense
            :items="transformOptions"
            item-text="label"
            item-value="id"
            class="my-4"
          >
            <template #append-outer>
              <v-btn icon @click="showTransformHint = !showTransformHint">
                <v-icon color="secondary"> fas fa-question-circle </v-icon>
              </v-btn>
            </template>
          </v-select>
          <template v-if="transformOption !== 'none'">
            <v-row
              v-if="transformOption === 'zscoreFixed'"
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
              v-if="transformOption === 'zscoreMoving'"
              v-model="zScoreMovingIntervalTimeSteps"
              label="Transform window"
              outlined
              dense
              type="number"
              suffix="time steps"
            >
            </v-text-field>
          </template>
          <v-btn
            block
            class="font-weight-bold"
            color="accent"
            :disabled="isUpdateDisabled"
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
import { initializeDataset, retrieveAnalysis } from "@/store/actions";

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
  smoothing = null;
  display = null;
  yearSelected = 1500;
  zScoreMovingIntervalTimeSteps = 25;
  showSmoothingHint = false;
  showTransformHint = false;
  showZonalStatisticHint = false;

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

  timeSeriesTransformConverter = {
    none: function (analyzeVue) {
      return null;
    },
    centeredAverage: function (analyzeVue) {
      return {
        type: "MovingAverageSmoother",
        method: "centered",
        width: analyzeVue.smoothingTimeStep,
      };
    },
    trailingAverage: function (analyzeVue) {
      return {
        type: "MovingAverageSmoother",
        method: "trailing",
        width: analyzeVue.smoothingTimeStep,
      };
    },
    zscoreFixed: function (analyzeVue) {
      return {
        type: "ZScoreFixedInterval",
        start: analyzeVue.timeRange.lb.year,
        end: analyzeVue.timeRange.ub.year,
      };
    },
    zscoreMoving: function (analyzeVue) {
      return {
        type: "ZScoreMovingInterval",
        width: analyzeVue.zScoreMovingIntervalTimeSteps,
      };
    },
  };

  smoothingTimeStep = 7;

  transformOption = "none";

  transformOptions = [
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

  get summaryStatistics() {
    return [
      this.$api().dataset.summaryStatistics,
      this.$api().analysis.summaryStatistics,
    ];
  }

  get hasSmoothingOption() {
    return this.smoothingOption !== "none";
  }

  get response() {
    return this.$api().analysis.response;
  }

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get temporalRange() {
    return this.$api().dataset.temporalRange;
  }

  get studyAreaGeometry() {
    return this.$api().dataset.geoJson?.geometry;
  }

  get isStudyAreaPolygon() {
    return this.studyAreaGeometry?.type !== "Point";
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

  get minYear() {
    return parseInt(this.metadata.timespan.period.gte);
  }

  get maxYear() {
    return parseInt(this.metadata.timespan.period.lte);
  }

  get isLoading() {
    return this.$api().analysis.waitingForResponse;
  }

  get isUpdateDisabled() {
    return this.transformOption === "none" && this.smoothingOption === "none";
  }

  created() {
    const datasetId = this.$route.params.id;
    const variableId = this.$route.params.variable;
    const api = this.$api();
    initializeDataset(this.$warehouse, api, datasetId, variableId);
    console.log("analyze initialized dataset and default variable");
  }

  async updated() {
    console.log("updated - variable: ", this.variable);
  }

  async mounted() {
    // load default variable
    this.yearSelected = this.timeRange.lb.year;
  }

  setYear(year) {
    this.yearSelected = year;
  }

  get transformFunctions() {
    // FIXME: refactor this more
    const smoothingTransform = this.timeSeriesTransformConverter[
      this.smoothingOption
    ](this);
    const displayTransform = this.timeSeriesTransformConverter[
      this.transformOption
    ](this);
    const transforms = [];
    if (smoothingTransform !== null) {
      transforms.push(smoothingTransform);
    }
    if (displayTransform) {
      transforms.push(displayTransform);
    }
    return transforms;
  }

  async updateTimeSeries() {
    console.log("submitting to web service");
    const datasetApi = this.$api().dataset;
    const transforms = this.transformFunctions;
    const query = {
      dataset_id: datasetApi.metadata.id,
      variable_id: datasetApi.variable.id,
      selected_area: this.studyAreaGeometry,
      zonal_statistic: this.zonalStatistic,
      transforms,
      time_range: {
        gte: this.temporalRange[0],
        lte: this.temporalRange[1],
      },
    };
    await retrieveAnalysis(this.$api(), query);
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

.subtitle {
  color: #596d7b;
  font-size: 1.5rem;
}
</style>
