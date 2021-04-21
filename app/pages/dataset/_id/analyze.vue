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
          <h3 class="mx-3 my-2 title text-capitalize">
            Statistics for the Temporal Interval
          </h3>
          <v-row no-gutters justify="center" align="center" style="height: 15%">
            <!-- display stats for temporal interval -->
            <template v-for="(statistic, id) in statistics">
              <v-col :key="id" class="mx-2" align-self="stretch"
                ><v-card height="100%">
                  <v-card-text>
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-icon small v-bind="on" v-on="attrs"
                          >fas fa-question-circle</v-icon
                        >
                      </template>
                      <span>This is a mean</span>
                    </v-tooltip>
                    <p class="text-center no-gutters headline font-weight-bold">
                      {{ statistic.data }}
                    </p>
                    <p class="text-center subtitle">{{ statistic.label }}</p>
                  </v-card-text>
                </v-card></v-col
              >
            </template>
          </v-row>
          <h3 class="mx-3 my-2 title">
            For each Year step, selected area is summarized as the:
          </h3>
          <v-row no-gutters>
            <!-- select mean | median -->
            <v-radio-group row mandatory class="mx-3">
              <v-radio color="accent" label="Mean" value="mean"></v-radio>
              <v-radio color="accent" label="Median" value="median"></v-radio>
              <p class="my-auto">of its pixels</p>
            </v-radio-group>
          </v-row>
          <!-- smoothing options -->
          <h3 class="mx-3 my-2 title">Smoothing</h3>
          <v-row no-gutters class="outlined grow">
            <v-select
              v-model="smoothingOption"
              label="Select a smoothing option"
              item-color="secondary"
              color="secondary"
              dense
              :items="smoothingOptions"
              item-text="label"
              item-value="id"
              outlined
            />
          </v-row>
          <v-row v-if="smoothingOption !== 'none'">
            <v-text-field
              v-model="smoothingTimeStep"
              label="Time Step Window"
            />
          </v-row>
          <!-- display options -->
          <h3 class="mx-3 my-2 title">Display</h3>
          <v-row>
            <v-select
              v-model="displayOption"
              label="Select a transform option"
              item-color="secondary"
              color="secondary"
              dense
              :items="displayOptions"
              item-text="label"
              item-value="id"
              outlined
            />
          </v-row>
          <v-row v-if="displayOption === 'zscoreFixed'">
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
          <v-row v-if="displayOption === 'zscoreMoving'">
            <v-text-field
              v-model="zScoreMovingIntervalTimeSteps"
              label="Time Steps"
              outlined
              dense
              type="number"
            ></v-text-field>
          </v-row>
          <v-row><v-btn type="submit">Update</v-btn></v-row>
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

  transformOption = "mean";

  transformOptions = [
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

  smoothingOption = "none";

  smoothingOptions = [
    {
      label: "Modeled Values",
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
  ];

  smoothingTimeStep = 7;

  displayOption = "none";

  displayOptions = [
    {
      label: "None",
      id: "none",
    },
    {
      label: "Z-Score wrt Fixed Interval",
      id: "zscoreFixed",
    },
    {
      label: "Z-Score wrt Moving Interval",
      id: "zscoreMoving",
    },
  ];

  statistics = [
    {
      id: "mean",
      label: "Mean",
      data: this.mean,
    },
    {
      id: "median",
      label: "Median",
      data: this.median,
    },
    {
      id: "stdDev",
      label: "Standard Deviation",
      data: this.stdDev,
    },
  ];

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
    return this.$api().dataset.mean;
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

  get minYear() {
    return parseInt(this.metadata.timespan.period.gte);
  }

  get maxYear() {
    return parseInt(this.metadata.timespan.period.lte);
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
</style>
