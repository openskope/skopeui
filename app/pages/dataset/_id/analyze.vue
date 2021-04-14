<template>
  <v-responsive height="100%" width="100%">
    <LoadingSpinner v-if="isLoading" />
    <v-row v-else class="d-flex" style="height: 100%">
      <!-- title -->
      <v-col
        class="d-flex flex-row flex-grow-0 flex-shrink-1 ma-0 px-10 pb-0 pt-10"
      >
        <h1 class="font-weight-light">
          {{ metadata.title }}
        </h1>
        <v-tooltip bottom
          ><template #activator="{ on, attrs }">
            <v-btn icon color="secondary" class="mx-3">
              <v-icon
                v-bind="attrs"
                large
                @click="instructions = !instructions"
                v-on="on"
                >info</v-icon
              >
            </v-btn> </template
          ><span>Instructions</span></v-tooltip
        >
        <v-dialog v-model="dialog" max-width="600px">
          <template #activator="{ on, attrs }">
            <v-btn depressed color="accent" v-bind="attrs" v-on="on"
              >View Metadata</v-btn
            >
          </template>
          <v-card>
            <v-card-title class="accent text--white">
              Metadata
              <v-spacer></v-spacer>
              <v-btn icon @click="dialog = false">
                <v-icon color="white">fas fa-window-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text><Metadata /></v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="dialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
          Select the study area for the dataset by using the drawing tools on
          the map. A study area must be defined in order to visualize and
          analyze the dataset.
        </v-alert>
      </v-col>
      <v-col class="d-flex flex-grow-1 flex-shrink-0 mx-auto">
        <v-row class="mx-auto pa-0" style="height: 100%; width: 100%">
          <v-col no-gutters cols="7" style="height: 100%">
            <v-card class="pa-3" elevation="2" outlined style="height: 100%">
              <v-card-title>
                <h1 class="headline">Time Series</h1>
              </v-card-title>
              <TimeSeriesPlot
                class="timeseries-flex"
                :time-series="timeSeries"
                :year-selected="yearSelected"
                @yearSelected="setYear"
              />
            </v-card>
          </v-col>
          <v-col no-gutters cols="5" style="height: 100%">
            <v-card elevation="2" color="primary">
              <v-card-title>
                <h1 class="headline white--text">Analysis</h1>
              </v-card-title>
              <v-form>
                <!-- row 1 -->
                <v-row
                  no-gutters
                  :style="'background-color: white'"
                  class="outlined"
                >
                  <!-- selected area -->
                  <v-col class="outlined" cols="4">
                    <h3 class="ma-3 title">Selected area</h3>
                    <!-- area in km2 -->
                    <v-row class="mx-3 my-2">
                      <p class="subtitle">
                        {{ selectedAreaInSquareKilometers }} km<sup>2</sup>
                      </p>
                    </v-row>
                    <!-- area in pixels -->
                    <v-row class="mx-3">
                      <span class="my-1">
                        <h3 class="title-2">Pixels</h3>
                        <p>45.8 km<sup>2</sup> (88 pixels)</p>
                      </span>
                    </v-row>
                  </v-col>
                  <!-- selected variable -->
                  <v-col class="outlined" cols="8">
                    <h3 class="ma-3 title">Selected variable</h3>
                    <v-select
                      v-model="variable"
                      label="Select a variable"
                      item-color="accent"
                      color="accent"
                      dense
                      :items="variables"
                      item-text="name"
                      item-value="id"
                      class="mx-3"
                      :style="'width: 24rem'"
                      :prepend-icon="layerGroup.icon"
                      single-line
                      outlined
                    >
                    </v-select>
                  </v-col>
                </v-row>
                <!-- end row 1 -->
                <!-- row 2 -->
                <v-row
                  no-gutters
                  :style="'background-color: white'"
                  class="outlined end-section"
                >
                  <h3 class="ma-3 title">Temporal range</h3>
                  <!-- temporal range -->
                  <v-row v-if="temporalResolution !== ''" class="mx-1">
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="timeRange.lb.year"
                        label="Year (Lower Bound)"
                        outlined
                        dense
                        type="number"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="timeRange.ub.year"
                        label="Year (Upper Bound)"
                        outlined
                        dense
                        type="number"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row v-if="temporalResolution === 'month'">
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="timeRange.lb.month"
                        dense
                        outlined
                        label="Month (Lower Bound)"
                        type="number"
                      />
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="timeRange.lb.month"
                        dense
                        outlined
                        label="Month (Lower Bound)"
                        type="number"
                      />
                    </v-col>
                  </v-row>
                </v-row>
                <!-- end row 2 -->

                <!-- row 3 -->
                <v-row
                  no-gutters
                  :style="'background-color: white'"
                  class="outlined end-section"
                >
                  <h3 class="mx-3 my-2 title">
                    For each Year step, selected area is summarized as the:
                  </h3>
                  <!-- select mean | median -->
                  <v-radio-group row mandatory class="mx-3">
                    <v-radio color="accent" label="Mean" value="mean"></v-radio>
                    <v-radio
                      color="accent"
                      label="Median"
                      value="median"
                    ></v-radio>
                    <p class="my-auto">of its pixels</p>
                  </v-radio-group>
                </v-row>
                <!-- end row 3 -->

                <!-- row 4 -->
                <v-row
                  no-gutters
                  :style="'background-color: white'"
                  class="outlined end-section"
                >
                  <h3 class="mx-3 my-2 title">
                    Statistics for the Temporal Interval
                  </h3>
                  <!-- display stats for temporal interval -->
                  <v-row class="ma-2">
                    <v-col class="mx-2">
                      <v-chip color="secondary" large label text-color="white">
                        Mean: 247.6
                      </v-chip>
                    </v-col>
                    <v-col class="mx-2">
                      <v-chip color="secondary" large label text-color="white">
                        Median: 240.2
                      </v-chip>
                    </v-col>
                    <v-col class="mx-2">
                      <v-chip color="secondary" large label text-color="white">
                        Std. Dev.: 36.4<sup>3</sup>
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-row>
                <!-- end row 4 -->

                <!-- row 5 -->
                <v-row
                  no-gutters
                  :style="'background-color: white'"
                  class="outlined end-section"
                >
                  <h3 class="mx-3 my-2 title">Smoothing</h3>
                  <!-- smoothing radio selection -->
                  <v-row class="my-5">
                    <v-col>
                      <v-radio-group v-model="smoothing" column>
                        <v-radio label="None" value="none"></v-radio>
                        <v-radio label="Centered running average" value="cra">
                        </v-radio>
                        <v-text-field
                          v-if="smoothing == 'cra'"
                          label="Year window"
                          outlined
                          dense
                        ></v-text-field>
                        <v-radio
                          label="Trailing running average"
                          value="tra"
                        ></v-radio>
                        <v-text-field
                          v-if="smoothing == 'tra'"
                          label="Year window"
                          outlined
                          dense
                        ></v-text-field>
                        <v-radio
                          label="Spline smoothing"
                          value="spline"
                        ></v-radio>
                      </v-radio-group>
                    </v-col>
                  </v-row>
                </v-row>
                <!-- end row 5 -->

                <!-- row 6 -->
                <v-row
                  no-gutters
                  :style="'background-color: white'"
                  class="outlined"
                >
                  <h3 class="mx-3 my-2 title">Display</h3>
                  <!-- display radio selection -->
                  <v-radio-group v-model="display" column>
                    <v-radio label="Modeled values" value="modeled"></v-radio>
                    <v-radio
                      label="Z-score wrt Fixed Interval from"
                      value="fixed"
                    ></v-radio>
                    <v-row v-if="display === 'fixed'">
                      <v-col>
                        <v-text-field
                          v-model="timeRange.lb.year"
                          label="Year (Lower Bound)"
                          outlined
                          dense
                          type="number"
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          v-model="timeRange.ub.year"
                          label="Year (Upper Bound)"
                          outlined
                          dense
                          type="number"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-radio
                      label="Z-score wrt Moving Interval of Previous:"
                      value="moving"
                    ></v-radio>
                    <v-text-field
                      v-if="display === 'moving'"
                      label="Years"
                      outlined
                      dense
                    ></v-text-field>
                  </v-radio-group>
                </v-row>
                <v-row no-gutters>
                  <v-btn @click="submit">Submit</v-btn>
                </v-row>
              </v-form>
            </v-card>
          </v-col>
          <!--            </template>-->
        </v-row>
      </v-col>
    </v-row>
  </v-responsive>
</template>

<script>
import KernelRegression from "@/components/chart-form/KernelRegression.vue";
import RunningAverage from "@/components/chart-form/RunningAverage.vue";
import TimeSeriesPlot from "@/components/TimeSeriesPlot.vue";
import Metadata from "@/components/action/Metadata.vue";
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
    Metadata,
  },
})
class Analyze extends Vue {
  dialog = false;
  instructions = false;
  smoothing = null;
  display = null;
  timeSeriesUnWatcher = null;
  yearSelected = 1500;

  layerGroup = {
    icon: "fas fa-layer-group",
  };

  polygon = {
    icon: "fas fa-draw-polygon",
  };

  selectedZonalStatistic = "mean";

  zonalStatisticOpts = [
    {
      label: "Mean",
      id: "mean",
    },
    {
      label: "Median",
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

  selectedSmoother = "none";

  smootherOpts = [
    {
      label: "None",
      id: "none",
    },
    {
      label: "Moving Average (Trailing)",
      id: "trailingAverage",
    },
    {
      label: "Moving Average (Centered)",
      id: "centeredAverage",
    },
    {
      label: "Polynomial Spline",
      id: "polynomialSpline",
    },
  ];

  width = 7;

  selectedScaleTransform = "none";

  scaleTransformOpts = [
    {
      label: "None",
      id: "none",
    },
    {
      label: "Z-Score",
      id: "zscore",
    },
  ];

  get response() {
    return this.$api().analyze.response;
  }

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get studyArea() {
    return this.$api().dataset.geoJson;
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

  get selectedAreaInSquareKilometers() {
    return (this.$api().dataset.selectedAreaInSquareMeters / 1000000.0).toFixed(
      2
    );
  }

  get minYear() {
    return parseInt(this.metadata.timespan.period.gte);
  }

  get maxYear() {
    return parseInt(this.metadata.timespan.period.lte);
  }

  get isLoading() {
    return _.isNull(this.metadata);
  }

  setYear(year) {
    this.yearSelected = year;
  }

  async submit() {
    console.log("submitting to web service");
    await this.$api().analyze.retrieveAnalysis({
      dataset_id: "lbda-v2",
      variable_id: "palmer_modified_drought_index",
      selected_area: this.studyArea,
      zonal_statistic: "mean",
      transforms: [],
      time_range: {
        gte: 1500,
        lte: 1800,
      },
    });
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
            geometry: this.studyArea.geometry,
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
  height: calc(70vh - 96px);
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
.outlined {
  border: solid 1px #f3f3f3;
}

.title {
  color: #596d7b;
  text-transform: uppercase;
}

.title-2 {
  color: #596d7b;
  text-transform: uppercase;
}

.subtitle {
  color: #596d7b;
  font-size: 1.5rem;
}

.end-section {
  border-bottom: solid 1rem #f3f3f3;
}
</style>
