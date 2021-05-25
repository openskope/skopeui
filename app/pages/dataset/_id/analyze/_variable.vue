<template>
  <v-container fluid class="fill-height align-start">
    <v-row no-gutters>
      <!-- dataset title -->
      <v-col lg="12" md="12" sm="12" class="mb-3">
        <DatasetTitle :select-variable="true" />
      </v-col>
      <!-- time series -->
      <v-col
        class="d-flex timeseries-flex px-2 mb-3"
        lg="8"
        md="12"
        align-self="stretch"
      >
        <TimeSeriesPlot
          :show-step-controls="false"
          :show-area="true"
          :display-transformed-time-series="true"
          @selectedTemporalRange="updateTimeSeries"
        />
      </v-col>
      <!-- analysis form -->
      <v-col
        class="d-flex timeseries-flex px-2"
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
          <h2 class="subtitle">Selected Area Summary Statistic</h2>
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
            <template #prepend>
              <v-tooltip v-model="showZonalStatisticHint" left>
                <template #activator="{ attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    @click="showZonalStatisticHint = !showZonalStatisticHint"
                  >
                    <v-icon color="secondary"> fas fa-question-circle </v-icon>
                  </v-btn>
                </template>
                <span
                  >At each time step, the value used for the selected area is
                  the summary value (mean by default) of all selected
                  pixels.</span
                >
              </v-tooltip>
            </template>
          </v-select>
          <v-alert v-else type="secondary">
            Summary statistics are not available for a point geometry.
          </v-alert>
          <h2 class="subtitle">Smoothing</h2>
          <!--          <v-alert-->
          <!--            v-model="showSmoothingHint"-->
          <!--            border="top"-->
          <!--            colored-border-->
          <!--            icon="fas fa-question-circle"-->
          <!--            color="secondary"-->
          <!--            elevation="2"-->
          <!--            dismissible-->
          <!--          >-->
          <!--            <span v-if="smoothingOption == 'centeredAverage'">-->
          <!--              If window width is n, the graphed value for a given year is the-->
          <!--              {{ zonalStatistic }} the 2n+1 time step summary values for the-->
          <!--              selected area centered on that year.-->
          <!--            </span>-->
          <!--            <span v-else-if="smoothingOption === 'trailingAverage'">-->
          <!--              If the window width entered is n, the graphed value for a year is-->
          <!--              the {{ zonalStatistic }} of the n time step summary values for the-->
          <!--              current year and the n-1 preceding years-->
          <!--            </span>-->
          <!--            <span v-else>-->
          <!--              No smoothing the summary values for a given year are graphed.-->
          <!--            </span>-->
          <!--          </v-alert>-->
          <v-select
            v-model="smoothingOption"
            label="Smoothing options"
            item-color="secondary"
            color="primary"
            :items="smoothingOptions"
            item-text="label"
            item-value="id"
          >
            <template #prepend>
              <v-tooltip v-model="showSmoothingHint" left>
                <template #activator="{ attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    @click="showSmoothingHint = !showSmoothingHint"
                  >
                    <v-icon color="secondary"> fas fa-question-circle </v-icon>
                  </v-btn>
                </template>
                <span v-if="smoothingOption == 'centeredAverage'">
                  If window width is n, the graphed value for a given year is
                  the
                  {{ zonalStatistic }} the 2n+1 time step summary values for the
                  selected area centered on that year.
                </span>
                <span v-else-if="smoothingOption === 'trailingAverage'">
                  If the window width entered is n, the graphed value for a year
                  is the {{ zonalStatistic }} of the n time step summary values
                  for the current year and the n-1 preceding years
                </span>
                <span v-else>
                  No smoothing the summary values for a given year are graphed.
                </span>
              </v-tooltip>
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
          <!--          <v-alert-->
          <!--            v-model="showTransformHint"-->
          <!--            border="top"-->
          <!--            colored-border-->
          <!--            icon="fas fa-question-circle"-->
          <!--            color="secondary"-->
          <!--            elevation="2"-->
          <!--            dismissible-->
          <!--          >-->
          <!--            <span v-if="transformOption === 'zscoreFixed'">-->
          <!--              Displays Z-score transformed values relative to a fixed interval-->
          <!--              selected by the user.-->
          <!--            </span>-->
          <!--            <span v-else-if="transformOption === 'zscoreMoving'">-->
          <!--              Displays Z-score transformed values relative to a moving window of-->
          <!--              a size (n time steps) selected by the user.-->
          <!--            </span>-->
          <!--            <span v-else-->
          <!--              >Modeled values are graphed without any transformation.</span-->
          <!--            >-->
          <!--          </v-alert>-->
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
            <template #prepend>
              <v-tooltip v-model="showTransformHint" left>
                <template #activator="{ attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    @click="showTransformHint = !showTransformHint"
                  >
                    <v-icon color="secondary"> fas fa-question-circle </v-icon>
                  </v-btn>
                </template>
                <span v-if="transformOption === 'zscoreFixed'">
                  Displays Z-score transformed values relative to a fixed
                  interval selected by the user.
                </span>
                <span v-else-if="transformOption === 'zscoreMoving'">
                  Displays Z-score transformed values relative to a moving
                  window of a size (n time steps) selected by the user.
                </span>
                <span v-else
                  >Modeled values are graphed without any transformation.</span
                >
              </v-tooltip>
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
          <v-row justify="center" align="space-between">
            <v-col>
              <v-btn
                block
                class="font-weight-bold"
                color="accent"
                :disabled="isUpdateDisabled"
                @click="updateTimeSeries"
                >Update <v-icon small class="mx-2">update</v-icon></v-btn
              >
            </v-col>
            <v-col>
              <v-btn block @click="clearTransformedTimeSeries"> Clear </v-btn>
            </v-col>
          </v-row>
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
import { toISODate } from "@/store/stats";
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
  zScoreMovingIntervalTimeSteps = 25;
  showSmoothingHint = false;
  showTransformHint = false;
  showZonalStatisticHint = false;

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

  smoothingConverter = {
    none: function (analyzeVue) {
      return {
        type: "NoSmoother",
      };
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
  };

  transformConverter = {
    none: function (analyzeVue) {
      return {
        type: "NoTransform",
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
      label: "None. Modeled values displayed",
      id: "none",
    },
    {
      label:
        "Z-Score wrt Fixed Interval   (Z calculated using Mean and S.D. above)",
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
    if (this.$api().analysis.summaryStatistics.length === 0) {
      return [this.$api().dataset.summaryStatistics];
    }
    return this.$api().analysis.summaryStatistics;
  }

  get hasSmoothingOption() {
    return this.smoothingOption !== "none";
  }

  get hasTransformOption() {
    return this.transformOption !== "none";
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
    if (!_.isEqual(api.analysis.cachedAnalysisId, { datasetId, variableId })) {
      api.analysis.clearResponse();
    }
  }

  get transformFunction() {
    return this.transformConverter[this.transformOption](this);
  }

  get smoothingFunction() {
    return this.smoothingConverter[this.smoothingOption](this);
  }

  get requestedSeries() {
    const series = [{ name: "Original", smoother: { type: "NoSmoother" } }];
    if (this.hasSmoothingOption) {
      series.push({
        name: "Transformed",
        smoother: this.smoothingFunction,
      });
    }
    return series;
  }

  clearTransformedTimeSeries() {
    // clear smoothingOption and transformOption
    this.smoothingOption = "none";
    this.transformOption = "none";
    this.$api().analysis.clearResponse();
  }

  async updateTimeSeries() {
    console.log("submitting to web service");
    const datasetApi = this.$api().dataset;
    const query = {
      dataset_id: datasetApi.metadata.id,
      variable_id: datasetApi.variable.id,
      selected_area: this.studyAreaGeometry,
      zonal_statistic: this.zonalStatistic,
      transform: this.transformFunction,
      time_range: {
        gte: toISODate(this.temporalRange[0]),
        lte: toISODate(this.temporalRange[1]),
      },
      requested_series: this.requestedSeries,
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
