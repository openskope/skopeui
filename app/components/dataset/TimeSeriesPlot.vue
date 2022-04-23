<template>
  <v-card outlined height="100%" width="100%">
    <LoadingSpinner v-if="isLoading" />
    <v-card-text v-else-if="isLoaded" style="height: 90%">
      <v-toolbar flat class="py-0 my-0">
        <v-row align="baseline" justify="space-between">
          <!-- area -->
          <v-col v-if="showArea" cols="auto" class="d-flex">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <h3
                  v-bind="attrs"
                  class="font-weight-light text-center pa-2"
                  style="background-color: #e4e7ef"
                  v-on="on"
                >
                  {{ selectedAreaInSquareKm }} km<sup>2</sup>
                </h3>
              </template>
              <span>Selected area in square kilometers</span>
            </v-tooltip>
            <v-divider vertical class="mx-2"></v-divider>
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <h3
                  v-bind="attrs"
                  class="font-weight-light text-center pa-2"
                  style="background-color: #e4e7ef"
                  v-on="on"
                >
                  {{ totalCellArea }} km<sup>2</sup> ({{ numberOfCells }}
                  cells)
                </h3>
              </template>
              <span>Total cell area used in this time series calculation</span>
            </v-tooltip>
          </v-col>
          <!-- temporal range input -->
          <v-form v-model="isTemporalRangeValid">
            <v-col
              class="d-flex flex-row"
              cols="auto"
              @click="enableTemporalRangeEdit"
            >
              <!-- temporal range -->
              <v-text-field
                v-model.number="formTemporalRangeMin"
                label="Min Year"
                :disabled="!isTemporalRangeEditable"
                :min="minYear"
                :max="maxYear - 1"
                type="number"
                :rules="[validateMinYear]"
                @keydown.enter="setTemporalRange"
              >
                <template #append-outer>to</template>
              </v-text-field>
              <v-text-field
                v-model.number="formTemporalRangeMax"
                :disabled="!isTemporalRangeEditable"
                class="mx-2"
                label="Max Year"
                :hint="timeStepsLabel"
                persistent-hint
                :min="minYear + 1"
                :max="maxYear"
                :rules="[validateMaxYear]"
                type="number"
                @keydown.enter="setTemporalRange"
              >
              </v-text-field>
              <div class="d-flex flex-column mt-n2">
                <v-btn
                  :disabled="!hasTemporalRangeChanges || !isTemporalRangeValid"
                  x-small
                  color="secondary"
                  @click="setTemporalRange"
                  >Apply</v-btn
                >
                <v-btn x-small color="secondary" @click="resetTemporalRange"
                  >Reset</v-btn
                >
              </div>
            </v-col>
          </v-form>
          <!-- step controls -->
          <v-col v-if="showStepControls" align="right">
            <v-tooltip top>
              <template #activator="{ attrs, on }">
                <v-btn
                  icon
                  v-bind="attrs"
                  color="accent"
                  v-on="on"
                  @click="gotoFirstYear"
                >
                  <v-icon>skip_previous</v-icon>
                </v-btn>
              </template>
              <span>Go to the first year of the defined temporal range</span>
            </v-tooltip>
            <v-tooltip top>
              <template #activator="{ attrs, on }">
                <v-btn
                  icon
                  v-bind="attrs"
                  color="accent"
                  v-on="on"
                  @click="previousYear"
                >
                  <v-icon>arrow_left</v-icon>
                </v-btn>
              </template>
              <span>Previous year</span>
            </v-tooltip>
            <v-tooltip top>
              <template #activator="{ attrs, on }">
                <v-btn icon v-bind="attrs" v-on="on" @click="togglePlay">
                  <v-icon color="accent">{{ playIcon }}</v-icon>
                </v-btn>
              </template>
              <span>{{
                isAnimationPlaying ? "Pause animation" : "Animate layers"
              }}</span>
            </v-tooltip>
            <v-tooltip top>
              <template #activator="{ attrs, on }">
                <v-btn
                  icon
                  v-bind="attrs"
                  color="accent"
                  v-on="on"
                  @click="nextYear"
                >
                  <v-icon>arrow_right</v-icon>
                </v-btn>
              </template>
              <span>Next year</span>
            </v-tooltip>
            <v-tooltip top>
              <template #activator="{ attrs, on }">
                <v-btn
                  icon
                  v-bind="attrs"
                  color="accent"
                  v-on="on"
                  @click="gotoLastYear"
                >
                  <v-icon>skip_next</v-icon>
                </v-btn>
              </template>
              <span>Go to the last year of the defined temporal range</span>
            </v-tooltip>
          </v-col>
          <v-col v-if="showArea" cols="auto" align="right">
            <v-tooltip top>
              <template #activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  :to="selectAreaLocation"
                  class="mb-4 mx-3"
                  color="accent"
                  small
                  v-on="on"
                >
                  <v-icon small>fas fa-map</v-icon>
                </v-btn>
              </template>
              <span>Return to Select Area</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-toolbar>
      <!-- time series plot -->
      <client-only placeholder="Loading...">
        <Plotly
          ref="plot"
          class="time-series"
          :data="timeSeriesData"
          :layout="layoutMetadata"
          :options="options"
          @click="updatePlotlyYear"
        />
      </client-only>
    </v-card-text>
    <v-alert v-else class="m-1 p-3" :type="timeSeriesRequestStatus.type">
      <p
        v-for="message in timeSeriesRequestStatus.messages"
        :key="message.value"
      >
        {{ message.value }}
      </p>
    </v-alert>
  </v-card>
</template>

<script>
import Vue from "vue";
import _ from "lodash";
import { Component, Prop, Watch } from "nuxt-property-decorator";
import { loadTimeSeries, retrieveTimeSeries } from "@/store/actions";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

@Component({
  components: {
    // load time series plotly component lazily to avoid document is not defined errors
    // https://stackoverflow.com/a/50458090
    Plotly: () => import("vue-plotly").then((p) => p.Plotly),
    LoadingSpinner,
  },
})
class TimeSeriesPlot extends Vue {
  @Prop({ default: null })
  yearSelected;

  @Prop({ default: true })
  showStepControls;

  @Prop({ default: false })
  showArea;

  @Prop({})
  traces;

  @Prop({ default: null })
  yAxisLabel;

  // "play" automatically advances the timeseries year
  animationSpeed = 2000;
  isAnimationPlaying = false;
  // FIXME: clean up https://github.com/openskope/skopeui/issues/106
  localTemporalRangeMin = 1;
  localTemporalRangeMax = 2020;
  isTemporalRangeEditable = false;
  isTemporalRangeValid = false;
  timeSeriesWatch = null;

  get timeStepsLabel() {
    const timeSteps =
      this.selectedTemporalRange[1] - this.selectedTemporalRange[0] + 1;
    return `${timeSteps} time steps`;
  }

  get formTemporalRangeMin() {
    return this.isTemporalRangeEditable
      ? this.localTemporalRangeMin
      : this.selectedTemporalRange[0];
  }

  get formTemporalRangeMax() {
    return this.isTemporalRangeEditable
      ? this.localTemporalRangeMax
      : this.selectedTemporalRange[1];
  }

  set formTemporalRangeMin(value) {
    this.localTemporalRangeMin = value;
  }

  set formTemporalRangeMax(value) {
    this.localTemporalRangeMax = value;
  }

  get hasTemporalRangeChanges() {
    return (
      this.localTemporalRangeMin !== this.selectedTemporalRange[0] ||
      this.localTemporalRangeMax !== this.selectedTemporalRange[1]
    );
  }

  get selectAreaLocation() {
    return {
      name: "dataset-id",
      params: { id: this.$route.params.id },
    };
  }

  get selectedTemporalRange() {
    return this.$api().dataset.temporalRange;
  }

  set selectedTemporalRange(temporalRange) {
    this.$api().dataset.setTemporalRange(temporalRange);
    this.$emit("selected-temporal-range", temporalRange);
  }

  get temporalRangeMin() {
    return this.$api().dataset.temporalRangeMin;
  }

  get temporalRangeMax() {
    return this.$api().dataset.temporalRangeMax;
  }

  get timeSeriesRequestStatus() {
    return this.$api().dataset.timeSeriesRequestStatus;
  }

  get isLoading() {
    return this.$api().dataset.isTimeSeriesLoading;
  }

  get isLoaded() {
    return this.$api().dataset.isTimeSeriesLoaded;
  }

  get selectedAreaInSquareKm() {
    return this.$api().dataset.selectedAreaInSquareKm;
  }

  get minYear() {
    return this.$api().dataset.minYear;
  }

  get maxYear() {
    return this.$api().dataset.maxYear;
  }

  get variable() {
    return this.$api().dataset.variable;
  }

  get xAxisTitle() {
    return this.yearSelected == null
      ? "Year"
      : `<b>Year ${this.yearSelected}</b>`;
  }

  get yAxisTitle() {
    return !this.yAxisLabel ? this.variable.name : this.yAxisLabel;
  }

  get layoutMetadata() {
    return {
      margin: {
        b: 60,
        t: 10,
        pad: 2,
      },
      showlegend: this.hasMultipleTimeSeries,
      xaxis: {
        title: this.xAxisTitle,
        linewidth: 3,
        gridwidth: 3,
        automargin: true,
      },
      yaxis: {
        title: this.yAxisTitle,
        linewidth: 3,
        gridwidth: 3,
        automargin: true,
      },
      font: {
        size: 14,
      },
      shapes: this.shapes,
    };
  }

  get options() {
    return {
      modeBarButtonsToRemove: ["toImage"],
      responsive: true,
    };
  }

  get playIcon() {
    if (this.isAnimationPlaying) {
      return "pause_circle_filled";
    } else {
      return "play_circle_filled";
    }
  }

  get shapes() {
    if (!_.isNull(this.yearSelected)) {
      return [
        {
          type: "line",
          x0: this.yearSelected,
          x1: this.yearSelected,
          yref: "paper",
          y0: 0,
          y1: 1,
          line: {
            color: "rgb(255, 140, 0)",
            width: 3,
          },
        },
      ];
    }
    return [];
  }

  get canHandleTimeSeriesRequest() {
    return this.$api().dataset.canHandleTimeSeriesRequest;
  }

  get hasTimeSeries() {
    return this.traces != null && this.traces[0].x.length > 0;
  }

  get hasMultipleTimeSeries() {
    // FIXME: assume traces always has one element
    return this.traces != null && this.traces.length > 1;
  }

  get timeSeriesData() {
    return this.traces;
  }

  get totalCellArea() {
    return this.$api().dataset.totalCellAreaInSquareKm;
  }

  get numberOfCells() {
    return this.$api().dataset.numberOfCells;
  }

  get timeSeriesRequestData() {
    return this.$api().dataset.timeSeriesRequestData;
  }

  async mounted() {
    await loadTimeSeries(this.$api());
    this.localTemporalRangeMin = this.selectedTemporalRange[0];
    this.localTemporalRangeMax = this.selectedTemporalRange[1];
    this.timeSeriesWatch = this.$watch(
      "timeSeriesRequestData",
      async function (data) {
        console.log("Retrieving new time series");
        await retrieveTimeSeries(this.$api(), data);
      }
    );
  }

  enableTemporalRangeEdit() {
    if (this.isTemporalRangeEditable) {
      return;
    }
    this.localTemporalRangeMin = this.selectedTemporalRange[0];
    this.localTemporalRangeMax = this.selectedTemporalRange[1];
    this.isTemporalRangeEditable = true;
  }

  destroyed() {
    if (this.timeSeriesWatch) {
      this.timeSeriesWatch();
    }
  }

  validateMinYear(value) {
    if (value < this.minYear) {
      return `Please enter a min year >= ${this.minYear}`;
    }
    if (value >= this.maxYear) {
      return `Please enter a min year < ${this.maxYear}`;
    }
    return true;
  }

  validateMaxYear(value) {
    if (value <= this.minYear) {
      return `Please enter a max year > ${this.minYear}`;
    }
    if (value > this.maxYear) {
      return `Please enter a max year <= ${this.maxYear}`;
    }
    return true;
  }

  updatePlotlyYear(data) {
    this.setYear(data.points[0].x);
  }

  setYear(year) {
    this.$emit("year-selected", year);
  }

  setTemporalRange() {
    // no-op if local temporal range min and max are equal to the selected temporal range
    if (!this.hasTemporalRangeChanges) {
      return;
    }
    if (!this.isTemporalRangeValid) {
      return;
    }
    this.selectedTemporalRange = [
      this.localTemporalRangeMin,
      this.localTemporalRangeMax,
    ];
    this.isTemporalRangeEditable = false;
    // if yearSelected is set, clamp it to the new temporal range min / max if needed
    if (this.yearSelected == null) {
      return;
    }
    if (this.yearSelected < this.temporalRangeMin) {
      this.setYear(this.temporalRangeMin);
    } else if (this.yearSelected > this.temporalRangeMax) {
      this.setYear(this.temporalRangeMax);
    }
  }

  resetTemporalRange() {
    this.localTemporalRangeMin = this.$api().dataset.minYear;
    this.localTemporalRangeMax = this.$api().dataset.maxYear;
    this.setTemporalRange();
  }

  gotoFirstYear() {
    if (this.variable === null) {
      return;
    }
    this.setYear(this.temporalRangeMin);
  }

  gotoLastYear() {
    if (this.variable === null) {
      return;
    }
    this.setYear(this.temporalRangeMax);
  }

  nextYear() {
    if (this.variable === null) {
      return;
    }
    this.setYear(
      _.clamp(
        parseInt(this.yearSelected) + 1,
        this.temporalRangeMin,
        this.temporalRangeMax
      )
    );
  }

  previousYear() {
    if (this.variable === null) {
      return;
    }
    this.setYear(
      _.clamp(
        this.yearSelected - 1,
        this.temporalRangeMin,
        this.temporalRangeMax
      )
    );
  }

  togglePlay(event) {
    this.isAnimationPlaying = !this.isAnimationPlaying;
    if (this.isAnimationPlaying) {
      // start an interval
      const animationInterval = setInterval(() => {
        if (
          this.isAnimationPlaying &&
          this.yearSelected < this.temporalRangeMax
        ) {
          this.nextYear();
        } else {
          this.isAnimationPlaying = false;
          clearInterval(animationInterval);
          return;
        }
      }, this.animationSpeed);
    }
  }

  async getTimeSeriesPlotImage() {
    const svg = await this.$refs.plot.toImage({
      format: "svg",
      height: 600,
      width: 1200,
    });
    const png = await this.$refs.plot.toImage({
      format: "png",
      height: 600,
      width: 1200,
    });
    return {
      png,
      svg,
    };
  }

  @Watch("timeSeriesData")
  watchTimeSeriesData(timeSeriesData) {
    if (this.$refs.plot) {
      this.$refs.plot.update(timeSeriesData, this.layoutMetadata);
    }
  }

  @Watch("layoutMetadata")
  watchLayoutMetadata(layoutMetadata) {
    if (this.$refs.plot) {
      this.$refs.plot.update(this.timeSeriesData, layoutMetadata);
    }
  }
}
export default TimeSeriesPlot;
</script>
<style>
.time-series {
  height: 100%;
}
</style>
