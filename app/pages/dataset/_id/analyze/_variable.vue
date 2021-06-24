<template>
  <v-container class="fill-height align-start" fluid>
    <v-row no-gutters>
      <!-- dataset title -->
      <v-col class="mb-3" lg="12" md="12" sm="12">
        <DatasetTitle :select-variable="true">
          <v-btn color="secondary" depressed @click="exportData">
            Download
            <v-icon class="ml-2" small>download</v-icon>
          </v-btn>
        </DatasetTitle>
      </v-col>
      <!-- time series -->
      <v-col
        align-self="stretch"
        class="d-flex timeseries-flex px-2 mb-3"
        lg="8"
        md="12"
      >
        <TimeSeriesPlot
          ref="plot"
          :key="analysisRequestData"
          :show-area="true"
          :show-step-controls="false"
          :traces="traces"
          @selectedTemporalRange="updateTimeSeries"
        />
      </v-col>
      <!-- analysis form -->
      <v-col
        align-self="stretch"
        class="d-flex timeseries-flex px-2"
        lg="4"
        md="12"
        style="background-color: #f4f7ff"
      >
        <v-form style="width: 100%">
          <!-- /////////// STATS FOR TEMPORAL INTERVAL /////////// -->
          <h1 class="font-weight-light">
            Statistics for the Temporal Interval
          </h1>
          <v-data-table
            :disable-filtering="true"
            :disable-pagination="true"
            :disable-sort="true"
            :headers="statisticsHeaders"
            :hide-default-footer="true"
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
            color="secondary"
            colored-border
            dismissible
            elevation="2"
            icon="fas fa-question-circle"
          >
            At each time step, the value used for the selected area is the
            summary value (mean by default) of all selected pixels.
          </v-alert>
          <v-select
            v-if="isStudyAreaPolygon"
            v-model="zonalStatistic"
            :items="zonalStatisticOptions"
            color="primary"
            item-text="label"
            item-value="id"
            label="For each time step, summarize selected area as"
          >
            <template #prepend>
              <v-tooltip v-model="showZonalStatisticHint" left>
                <template #activator="{ attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    @click="showZonalStatisticHint = !showZonalStatisticHint"
                  >
                    <v-icon color="secondary"> fas fa-question-circle</v-icon>
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
            :items="smoothingOptions"
            color="primary"
            item-color="secondary"
            item-text="label"
            item-value="id"
            label="Smoothing options"
          >
            <template #prepend>
              <v-tooltip v-model="showSmoothingHint" left>
                <template #activator="{ attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    @click="showSmoothingHint = !showSmoothingHint"
                  >
                    <v-icon color="secondary"> fas fa-question-circle</v-icon>
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
            :items="transformOptions"
            class="my-4"
            color="secondary"
            dense
            item-color="secondary"
            item-text="label"
            item-value="id"
            label="Transformation options"
          >
            <template #prepend>
              <v-tooltip v-model="showTransformHint" left>
                <template #activator="{ attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    @click="showTransformHint = !showTransformHint"
                  >
                    <v-icon color="secondary"> fas fa-question-circle</v-icon>
                  </v-btn>
                </template>
                <span v-if="transformOption === 'zscoreFixed'">
                  Displays Z-score transformed values relative to a fixed
                  interval selected by the user.
                </span>
                <span v-if="transformOption === 'zscoreSelected'">
                  Displays Z-score transformed values using the selected
                  interval
                </span>
                <span v-else-if="transformOption === 'zscoreMoving'">
                  Displays Z-score transformed values relative to a moving
                  window of a size (n time steps) selected by the user.
                </span>
                <span v-else>
                  Modeled values are graphed without any transformation.
                </span>
              </v-tooltip>
            </template>
          </v-select>
          <template v-if="transformOption !== 'none'">
            <v-row
              v-if="transformOption === 'zscoreFixed'"
              align="baseline"
              class="mt-5"
              justify="start"
              no-gutters
            >
              <v-col class="mr-5">
                <v-text-field
                  v-model="timeRange.lb.year"
                  dense
                  label="Year (Lower Bound)"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="timeRange.ub.year"
                  dense
                  label="Year (Upper Bound)"
                  type="number"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              v-if="transformOption === 'zscoreMoving'"
              v-model="zScoreMovingIntervalTimeSteps"
              dense
              label="Transform window"
              outlined
              suffix="time steps"
              type="number"
            >
            </v-text-field>
          </template>
          <v-row align-content="space-between">
            <v-col>
              <v-btn block @click="clearTransformedTimeSeries"> Clear</v-btn>
            </v-col>
            <v-col>
              <v-btn
                :disabled="isUpdateDisabled"
                block
                class="font-weight-bold"
                color="accent"
                @click="updateTimeSeries"
                >Update
                <v-icon class="mx-2" small>update</v-icon>
              </v-btn>
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
import { toISODate, extractYear } from "@/store/stats";
import { buildReadme } from "@/store/modules/constants";
import _ from "lodash";
import JSZip from "jszip";
import Papa from "papaparse";

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
  requestDataWatcher = null;

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
      type: "NoSmoother",
      toRequestData: function (analyzeVue) {
        return {
          type: this.type,
        };
      },
      fromRequestData: function (analyzeVue, requestData) {
        analyzeVue.smoothingOption = this.id;
      },
    },
    {
      label: "Centered Running Average (+/- window width)",
      id: "centeredAverage",
      type: "MovingAverageSmoother",
      toRequestData: function (analyzeVue) {
        return {
          type: this.type,
          method: "centered",
          width: analyzeVue.smoothingTimeStep,
        };
      },
      fromRequestData: function (analyzeVue, requestData) {
        analyzeVue.smoothingOption = this.id;
        analyzeVue.smoothingTimeStep = requestData.width;
      },
    },
    {
      label: "Trailing Running Average (- window width)",
      id: "trailingAverage",
      type: "MovingAverageSmoother",
      toRequestData: function (analyzeVue) {
        return {
          type: this.type,
          method: "trailing",
          width: analyzeVue.smoothingTimeStep,
        };
      },
      fromRequestData: function (analyzeVue, requestData) {
        analyzeVue.smoothingOption = this.id;
        analyzeVue.smoothingTimeStep = requestData.width;
      },
    },
  ];

  smoothingTimeStep = 9;

  transformOption = "none";

  transformOptions = [
    {
      label: "None: Modeled values displayed",
      id: "none",
      type: "NoTransform",
      toRequestData: function () {
        return {
          type: this.type,
        };
      },
      fromRequestData: function (analyzeVue) {
        analyzeVue.transformOption = this.id;
      },
    },
    {
      label: "Z-Score wrt selected interval",
      id: "zscoreSelected",
      type: "ZScoreFixedInterval",
      toRequestData: function () {
        return {
          type: this.type,
        };
      },
      fromRequestData: function (analyzeVue, requestData) {
        if (requestData.time_range) {
          // FIXME: refactor this, we have two mappings for ZScoreFixedIntervals and
          // the only way to disambiguate them at the moment is testing for requestData.time_range
          analyzeVue.transformOption = "zscoreFixed";
          analyzeVue.time_range = requestData.time_range;
        } else {
          analyzeVue.transformOption = this.id;
        }
      },
    },
    {
      label: "Z-Score wrt fixed interval",
      id: "zscoreFixed",
      type: "ZScoreFixedInterval",
      toRequestData: function (analyzeVue) {
        return {
          type: this.type,
          time_range: {
            gte: toISODate(analyzeVue.timeRange.lb.year),
            lte: toISODate(analyzeVue.timeRange.ub.year),
          },
        };
      },
      fromRequestData: function (analyzeVue, requestData) {
        // FIXME: this does not get called due to multiple mappings for ZScoreFixedIntervals
        analyzeVue.transformOption = this.id;
        analyzeVue.time_range = requestData.time_range;
      },
    },
    {
      label: "Z-Score wrt moving interval (Z recalculated on moving basis)",
      id: "zscoreMoving",
      type: "ZScoreMovingInterval",
      toRequestData: function (analyzeVue) {
        return {
          type: this.type,
          width: analyzeVue.zScoreMovingIntervalTimeSteps,
        };
      },
      fromRequestData: function (analyzeVue, requestData) {
        analyzeVue.transformOption = this.id;
        analyzeVue.zScoreMovingIntervalTimeSteps = requestData.width;
      },
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

  get traces() {
    const transformedTimeSeries = this.$api().analysis.timeseries.map((ts) => ({
      ...ts,
      type: "scatter",
    }));
    if (transformedTimeSeries.length > 0) {
      return transformedTimeSeries;
    } else {
      return [
        {
          ...this.$api().dataset.filteredTimeSeries,
          type: "scatter",
          name: "Original",
        },
      ];
    }
  }

  get transformRequestData() {
    return this.transformOptions
      .find((x) => x.id === this.transformOption)
      .toRequestData(this);
  }

  get smoothingFunction() {
    return this.smoothingOptions
      .find((x) => x.id === this.smoothingOption)
      .toRequestData(this);
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

  async created() {
    const datasetId = this.$route.params.id;
    const variableId = this.$route.params.variable;
    const api = this.$api();
    initializeDataset(this.$warehouse, api, datasetId, variableId);
  }

  async mounted() {
    await this.loadRequestData();
    this.requestDataWatcher = this.$watch(
      "analysisRequestData",
      async function (data) {
        console.log("analysis request data has changed: ", data);
        await this.initializeFormData(data);
        await retrieveAnalysis(this.$api(), data);
      },
      { immediate: true }
    );
  }

  destroyed() {
    if (this.requestDataWatcher) {
      this.requestDataWatcher();
    }
  }

  get analysisRequestData() {
    return this.$api().analysis.request;
  }

  async loadRequestData() {
    // FIXME: form state should be loaded from the store instead of initialized here, move this to an action instead

    // load data from api.analysis.request if any
    // assume that it would be cleared by any actions that invalidate the request data
    // (change in dataset, study area, or variable)
    const api = this.$api();
    const requestData = api.analysis.request;
    console.log("request data in the store: ", requestData);
    if (_.isEmpty(requestData)) {
      api.analysis.setDefaultRequestData(api.dataset.defaultApiRequestData);
    }
  }

  async initializeFormData(requestData) {
    this.zonalStatistic = requestData.zonal_statistic;
    this.loadSmoothingOption(requestData.requested_series);
    this.loadTransformOption(requestData.transform);
    this.$api().dataset.setTemporalRange([
      extractYear(requestData.time_range.gte),
      extractYear(requestData.time_range.lte),
    ]);
  }

  loadTransformOption(transform) {
    const option = this.transformOptions.find((x) => x.type === transform.type);
    if (option) {
      option.fromRequestData(this, transform);
    }
  }

  loadSmoothingOption(requestedSeries) {
    // locate the transformed time series in requested_series from the request data
    const transformedSeries = requestedSeries.find(
      (x) => x.name === "Transformed"
    );
    if (transformedSeries) {
      // if the transformed time series exists, find the smoothing option that corresponds to the
      // transformed time series smoother option and invoke fromRequestData to set the appropriate
      // properties on this analyze vue component (if needed, e.g., smoothing time steps)
      const smoother = transformedSeries.smoother;
      const option = this.smoothingOptions.find(
        (x) => x.type === smoother.type
      );
      option.fromRequestData(this, smoother);
    }
  }

  clearTransformedTimeSeries() {
    this.transformOptions[0].generator();
    // clear smoothingOption and transformOption
    this.smoothingOption = "none";
    this.transformOption = "none";
    this.$api().analysis.setDefaultRequestData(
      this.$api().dataset.defaultApiRequestData
    );
  }

  tracesAsArrayOfObjects() {
    // convert timeseries data in plotly form into long form for a CSV
    // returns an array of objects [{name: .., x: ..., y: ... }]
    const rows = [];
    for (const trace of this.traces) {
      for (let row = 0; row < trace.x.length; row++) {
        rows.push({ name: trace.name, x: trace.x[row], y: trace.y[row] });
      }
    }
    return rows;
  }

  // plotly plot, data, summary stats
  async exportData() {
    const summaryStatistics = this.summaryStatistics.map((summary) =>
      _.mapValues(summary, (s) => {
        const f = parseFloat(s);
        return _.isNaN(f) ? s : f;
      })
    );
    const timeseries = this.traces;
    const plots = await this.$refs.plot.getTimeSeriesPlotImage();
    const png = await fetch(plots.png);
    const svg = await fetch(plots.svg);
    const geoJson = this.studyAreaGeometry;
    const request = this.$api().analysis.request;

    const zip = new JSZip();
    zip.file("request.json", JSON.stringify(request));
    zip.file("summaryStatistics.json", JSON.stringify(summaryStatistics));
    zip.file("timeseries.json", JSON.stringify(timeseries));
    zip.file("timeseries.csv", Papa.unparse(this.tracesAsArrayOfObjects()));
    zip.file("plot.png", await png.blob());
    zip.file("plot.svg", await svg.blob());
    zip.file("studyarea.geojson", JSON.stringify(geoJson));
    zip.file("README.md", buildReadme(request));

    const content = await zip.generateAsync({ type: "blob" });
    this.$download.saveAs(content, `${request.dataset_id}.zip`);
  }

  async updateTimeSeries() {
    // grab form inputs and set them on the store
    const api = this.$api();
    console.log("submitting to web service");
    const requestData = {
      ...api.dataset.defaultApiRequestData,
      // override zonal statistic, transform, time range, and requested series
      zonal_statistic: this.zonalStatistic,
      transform: this.transformRequestData,
      time_range: {
        gte: toISODate(this.temporalRange[0]),
        lte: toISODate(this.temporalRange[1]),
      },
      requested_series: this.requestedSeries,
    };
    api.analysis.setRequestData(requestData);
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
