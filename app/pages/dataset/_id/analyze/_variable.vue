<template>
  <v-container fluid class="fill-height align-start">
    <LoadingSpinner v-if="isLoadingMetadata"></LoadingSpinner>
    <template v-else>
      <v-row no-gutters>
        <v-col>
          <SubHeader :select-variable="true">
            <v-btn color="accent" depressed @click="exportData">
              Download
              <v-icon class="ml-2" small>download</v-icon>
            </v-btn>
          </SubHeader>
        </v-col>
      </v-row>
      <v-row dense>
        <!-- time series -->
        <v-col class="timeseries-flex" cols="12" lg="8">
          <TimeSeriesPlot
            ref="plot"
            :show-area="true"
            :show-step-controls="false"
            :traces="traces"
            :y-axis-label="yAxisLabel"
            @selected-temporal-range="updateTimeSeries"
          />
        </v-col>
        <!-- analysis form -->
        <v-col cols="12" lg="4" class="stats-form">
          <v-form
            ref="analysisRequestForm"
            v-model="analysisFormValid"
            class="pa-3 grey lighten-3"
            :class="{ 'mt-10': $vuetify.breakpoint.mdAndDown }"
          >
            <span class="subtitle">Statistics for the Temporal Interval</span>
            <v-data-table
              dense
              :disable-pagination="true"
              :headers="statisticsHeaders"
              :hide-default-footer="true"
              :items="summaryStatistics"
            >
            </v-data-table>
            <v-select
              v-model="zonalStatistic"
              class="mt-3"
              :items="zonalStatisticOptions"
              item-color="primary"
              item-text="label"
              item-value="id"
              label="For each time step, summarize selected area as"
              hint="Summary value of all selected pixels at each time step"
              :disabled="!isStudyAreaPolygon"
            >
            </v-select>
            <!-- /////////// TRANSFORMATION OPTIONS /////////// -->
            <v-select
              v-model="transformOption"
              :items="transformOptions"
              color="secondary"
              item-color="secondary"
              item-text="label"
              item-value="id"
              label="Select a transformation option"
              :hint="transformHint(transformOption)"
            >
            </v-select>
            <template v-if="transformOption !== 'none'">
              <v-row
                v-if="transformOption === 'zscoreFixed'"
                align="baseline"
                justify="start"
                no-gutters
                class="mt-2"
              >
                <v-col class="mr-5">
                  <v-text-field
                    v-model="timeRange.lb.year"
                    dense
                    outlined
                    label="Year (Lower Bound)"
                    type="number"
                    :rules="[validateMinYear]"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="timeRange.ub.year"
                    dense
                    outlined
                    label="Year (Upper Bound)"
                    type="number"
                    :rules="[validateMaxYear]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-text-field
                v-if="transformOption === 'zscoreMoving'"
                v-model="zScoreMovingIntervalTimeSteps"
                dense
                label="Transform window"
                outlined
                class="mt-2"
                suffix="time steps"
                type="number"
              >
              </v-text-field>
            </template>
            <v-select
              v-model="smoothingOption"
              :items="smoothingOptions"
              color="primary"
              item-color="secondary"
              item-text="label"
              item-value="id"
              label="Select a smoothing option"
              :hint="smoothingHint(smoothingOption)"
              class="mt-3"
            >
            </v-select>
            <v-text-field
              v-if="hasSmoothingOption"
              v-model="smoothingTimeStep"
              dense
              outlined
              class="mt-2"
              label="Smoothing window"
              suffix="time steps"
              type="number"
              :rules="[validateSmoothingWidth]"
            >
            </v-text-field>
            <v-row dense>
              <v-col>
                <v-btn @click="clearTransformedTimeSeries">Clear</v-btn>
              </v-col>
              <v-col align="end">
                <v-btn
                  :disabled="!analysisFormValid"
                  class="font-weight-bold"
                  color="accent"
                  @click="updateTimeSeries"
                  >Update
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import TimeSeriesPlot from "@/components/dataset/TimeSeriesPlot.vue";
import SubHeader from "@/components/dataset/SubHeader.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Vue from "vue";
import { Component, Watch } from "nuxt-property-decorator";
import {
  initializeDataset,
  initializeDatasetGeoJson,
  initializeRequestData,
  retrieveAnalysis,
} from "@/store/actions";
import { toISODate } from "@/store/stats";
import {
  buildReadme,
  DEFAULT_CENTERED_SMOOTHING_WIDTH,
  SMOOTHING_OPTIONS,
  TRANSFORM_OPTIONS,
} from "@/store/modules/constants";
import _ from "lodash";
import JSZip from "jszip";
import Papa from "papaparse";

@Component({
  layout: "DefaultLayout",
  components: {
    TimeSeriesPlot,
    SubHeader,
    LoadingSpinner,
  },
})
class Analyze extends Vue {
  zScoreMovingIntervalTimeSteps = 25;
  showSmoothingHint = false;
  showTransformHint = false;
  showZonalStatisticHint = false;
  analysisFormValid = true;
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

  smoothingTimeStep = DEFAULT_CENTERED_SMOOTHING_WIDTH;

  transformOption = "none";

  transformHint(transform) {
    switch (transform) {
      case "zscoreFixed":
        return "Displays Z-score transformed values relative to a fixed interval selected by the user";
      case "zscoreMoving":
        return "Displays Z-score transformed values relative to a moving window of a size (N time steps) selected by the user";
      case "zscoreSelected":
        return "Displays Z-score transformed values using the selected interval";
      default:
        return "Modeled values are graphed without any transformation";
    }
  }

  smoothingHint(smooth) {
    switch (smooth) {
      case "centeredAverage":
        return `Plots the ${this.zonalStatistic} of the current years and the previous and successive (N-1)/2 years where N = odd window width`;
      case "trailingAverage":
        return `Plots the ${this.zonalStatistic} of the current year and the N-1 preceding years where N = window width`;
      default:
        return "No smoothing the summary values for a given year are graphed";
    }
  }

  statisticsHeaders = [
    {
      text: "Series",
      align: "start",
      value: "name",
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
      value: "stdev",
      class: "title",
    },
  ];

  yAxisLabel = null;

  // --------- GETTERS ---------

  get transformOptions() {
    return TRANSFORM_OPTIONS;
  }

  get smoothingOptions() {
    return SMOOTHING_OPTIONS;
  }

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

  get isLoadingMetadata() {
    return this.metadata == null;
  }

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get temporalRange() {
    return this.$api().dataset.temporalRange;
  }

  get minYear() {
    return this.$api().dataset.minYear;
  }

  get maxYear() {
    return this.$api().dataset.maxYear;
  }

  get studyAreaGeoJson() {
    return this.$api().dataset.geoJson;
  }

  get isStudyAreaPolygon() {
    const geojson = this.studyAreaGeoJson;
    if (!geojson) {
      return false;
    }
    const polygons = ["Polygon", "MultiPolygon"];
    switch (geojson.type) {
      case "Polygon":
      case "MultiPolygon":
        return true;
      case "Feature":
        return polygons.includes(geojson.geometry.type);
      case "FeatureCollection":
        for (const feature of geojson.features) {
          if (polygons.includes(feature.geometry.type)) {
            return true;
          }
        }
      default:
        return false;
    }
  }

  get isLoading() {
    return this.$api().analysis.waitingForResponse;
  }

  get isUpdateDisabled() {
    return this.transformOption === "none" && this.smoothingOption === "none";
  }

  get traces() {
    const timeseries = this.$api().analysis.timeseries;
    const transformedTimeSeries = timeseries.map((ts) => ({
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

  get requestedSeriesOptions() {
    const series = [
      {
        name: this.hasTransformOption ? "Transformed" : "Original",
        smoother: { type: "NoSmoother" },
      },
    ];
    if (this.hasSmoothingOption) {
      series.push({
        name: "Smoothed",
        smoother: this.smoothingFunction,
      });
    }
    return series;
  }

  get analysisRequestData() {
    return this.$api().analysis.requestData;
  }

  // --------- LIFECYCLE HOOKS ---------

  async fetch() {
    const datasetId = this.$route.params.id;
    const variableId = this.$route.params.variable;
    // FIXME: assumes year timesteps
    const api = this.$api();
    await initializeDataset(this.$warehouse, api, datasetId, variableId);
    this.timeRange.lb.year = api.dataset.minYear;
    this.timeRange.ub.year = api.dataset.maxYear;
    console.log("INITIALIZED");
  }

  async mounted() {
    const api = this.$api();
    await initializeDatasetGeoJson(this.$warehouse, api);
    api.analysis.setGeoJson(api.dataset.geoJson);
    const requestData = await initializeRequestData(api);
    await this.initializeFormData(requestData);
    console.log("CLIENT SIDE MOUNT");
  }

  destroyed() {
    // FIXME: resets the analysis options when we leave this component
    // is this desired behavior?
    /*
    this.$api().analysis.setDefaultRequestData(
      this.$api().dataset.defaultApiRequestData
    );
    */
  }

  /*
  async beforeRouteUpdate(to, from) {
    await this.initialize(to.params.id, to.params.variable);
  }
  */

  // --------- METHODS ---------

  async initializeFormData(requestData) {
    this.zonalStatistic = requestData.zonal_statistic;
    this.loadSmoothingOption(requestData.requested_series_options);
    this.loadTransformOption(requestData.transform);
  }

  loadTransformOption(transform) {
    const option = this.transformOptions.find((x) => x.type === transform.type);
    if (option) {
      option.fromRequestData(this, transform);
    }
  }

  loadSmoothingOption(requestedSeriesOptions) {
    // locate the transformed time series in requested_series from the request data
    const smoothedSeriesOption = requestedSeriesOptions.find(
      (x) => x.name === "Smoothed"
    );
    if (smoothedSeriesOption) {
      // if the smoothed time series exists, find the smoothing option that corresponds to the
      // smoothed time series smoother option and invoke fromRequestData to set the appropriate
      // properties on this analyze vue component (if needed, e.g., smoothing time steps)
      const smoother = smoothedSeriesOption.smoother;
      const option = this.smoothingOptions.find(
        (x) => x.method === smoother.method
      );
      option.fromRequestData(this, smoother);
    }
  }

  clearTransformedTimeSeries() {
    // clear smoothingOption and transformOption
    const api = this.$api();
    this.smoothingOption = "none";
    this.transformOption = "none";
    api.analysis.setDefaultRequestData(api.dataset.defaultApiRequestData);
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
    const geoJson = this.studyAreaGeoJson;
    const requestData = this.$api().analysis.requestData;

    const zip = new JSZip();
    zip.file("skope-request.json", JSON.stringify(requestData));
    zip.file("summary-statistics.json", JSON.stringify(summaryStatistics));
    zip.file("time-series.json", JSON.stringify(timeseries));
    zip.file("time-series.csv", Papa.unparse(this.tracesAsArrayOfObjects()));
    zip.file("plot.png", await png.blob());
    zip.file("plot.svg", await svg.blob());
    zip.file("study-area.geojson", JSON.stringify(geoJson));
    zip.file("README.md", buildReadme(requestData));

    const content = await zip.generateAsync({ type: "blob" });
    const filename = this.generateDownloadFilename(requestData);
    this.$download.saveAs(content, `${filename}.zip`);
  }

  generateDownloadFilename(requestData) {
    return `${requestData.dataset_id}_${requestData.variable_id}`;
  }

  @Watch("analysisRequestData")
  async updateAnalysisRequestData() {
    console.log("Watching analysis store request data triggered");
    const data = this.analysisRequestData;
    await this.initializeFormData(data);
    await retrieveAnalysis(this.$api(), data);
    if (this.hasTransformOption) {
      this.yAxisLabel = this.transformOptions.find(
        (x) => x.id === this.transformOption
      ).label;
    } else {
      this.yAxisLabel = "";
    }
  }

  /**
   * Invoked when the user submits a request for statistics or a different temporal range.
   * Makes a request to skope-api with a new requested series and updates TimeSeriesPlot
   * with the response time series.
   */
  async updateTimeSeries() {
    // grab form inputs and set them on the store
    if (!this.analysisFormValid) {
      console.log("invalid form, aborting update");
      return;
    }
    const api = this.$api();
    if (api.analysis.waitingForResponse) {
      return;
    }
    console.log("updating time series with new request data");
    const requestData = {
      ...api.dataset.defaultApiRequestData,
      // override zonal statistic, transform, time range, and requested series
      zonal_statistic: this.zonalStatistic,
      transform: this.transformRequestData,
      time_range: {
        gte: toISODate(this.temporalRange[0]),
        lte: toISODate(this.temporalRange[1]),
      },
      requested_series_options: this.requestedSeriesOptions,
    };
    console.log("submitting to skope-api: ", requestData);
    api.analysis.setRequestData(requestData);
  }

  validateMinYear(year) {
    if (year < this.minYear) {
      return `Please enter a min year > ${this.minYear}`;
    }
    if (year > this.maxYear) {
      return `Please enter a min year <= ${this.maxYear}`;
    }
    return true;
  }

  validateMaxYear(year) {
    const minYear = this.minYear;
    const maxYear = this.maxYear;
    if (year < minYear) {
      return `Please enter a max year > ${minYear}`;
    }
    if (year > maxYear) {
      return `Please enter a max year <= ${maxYear}`;
    }
    return true;
  }

  validateSmoothingWidth(windowSize) {
    if (this.smoothingOption === "trailingAverage") {
      return true;
    }
    if (windowSize % 2 === 0) {
      return "Please enter an odd window size";
    }
    return true;
  }
}

export default Analyze;
</script>

<style scoped>
.timeseries-flex {
  height: calc(85vh - 96px);
}

.subtitle {
  color: #596d7b;
  font-size: 1.5rem;
}
</style>
