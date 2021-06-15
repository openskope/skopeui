<template>
  <v-card outlined height="100%" width="100%">
    <LoadingSpinner v-if="isLoading" />
    <v-card-text v-else-if="isLoaded" style="height: 90%">
      <v-toolbar flat class="py-0 my-0">
        <v-row align="baseline" justify="space-between">
          <!-- area -->
          <v-col v-if="showArea" cols="auto" class="d-flex">
            <v-tooltip bottom>
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
            <v-tooltip bottom>
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
              <span>Total cell area used in this timeseries calculation</span>
            </v-tooltip>
          </v-col>
          <!-- temporal range input -->
          <!-- lower temporal range input -->
          <v-col class="d-flex flex-row">
            <!-- temporal range -->
            <v-text-field
              v-model="formTemporalRange[0]"
              label="Min Year"
              :min="minYear"
              :max="maxYear - 1"
              type="number"
              :rules="[validateMinYear]"
              hint="Press enter to update"
              @keydown.enter="setTemporalRange"
              @blur="setTemporalRange"
            >
              <template #append-outer>to</template>
            </v-text-field>
            <v-text-field
              v-model="formTemporalRange[1]"
              class="mx-2"
              label="Max Year"
              :min="minYear + 1"
              :max="maxYear"
              :rules="[validateMaxYear]"
              type="number"
              hint="Press enter to update"
              @keydown.enter="setTemporalRange"
              @blur="setTemporalRange"
            >
            </v-text-field>
            <h3 class="mx-2 font-weight-light">
              ({{ selectedTemporalRange[1] - selectedTemporalRange[0] + 1 }}
              time steps)
            </h3>
          </v-col>
          <!-- step controls -->
          <v-col v-if="showStepControls" class="text-right">
            <v-tooltip bottom>
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
            <v-tooltip bottom>
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
            <v-tooltip bottom>
              <template #activator="{ attrs, on }">
                <v-btn icon v-bind="attrs" v-on="on" @click="togglePlay">
                  <v-icon color="accent">{{ playIcon }}</v-icon>
                </v-btn>
              </template>
              <span>Play</span>
            </v-tooltip>
            <v-tooltip bottom>
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
            <v-tooltip bottom>
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
          <v-col v-if="showArea" cols="auto" class="text-right">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  :to="selectAreaLocation"
                  class="mb-4 mx-3"
                  color="accent"
                  small
                  v-on="on"
                >
                  <v-icon small>edit</v-icon>
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
          class="timeseries"
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
import { Component } from "nuxt-property-decorator";
import { Emit, Prop, Watch } from "vue-property-decorator";
import { loadTimeSeries, retrieveTimeSeries } from "@/store/actions";
import LoadingSpinner from "@/components/global/LoadingSpinner.vue";

@Component({
  components: {
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

  @Prop({})
  transformedTimeSeries;

  // "play" automatically advances the timeseries year
  animationSpeed = 2000;
  isAnimationPlaying = false;
  formTemporalRange = [1, 2017];
  timeSeriesUnwatcher = null;

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
    this.$emit("selectedTemporalRange", temporalRange);
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

  get variableName() {
    const api = this.$api();
    return _.isEmpty(api.dataset.layer) ? "" : api.dataset.layer.name;
  }

  get geometry() {
    return this.$api().dataset.geoJson?.geometry ?? null;
  }

  get metadata() {
    return this.$api().dataset.metadata;
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

  get layoutMetadata() {
    const xaxisTitle =
      this.yearSelected == null ? "Year" : `<b>Year ${this.yearSelected}</b>`;
    return {
      margin: {
        l: 60,
        r: 10,
        b: 60,
        t: 10,
        pad: 4,
      },
      showlegend: false,
      xaxis: {
        title: xaxisTitle,
      },
      yaxis: {
        title: this.variableName,
      },
    };
  }

  get options() {
    return {
      modeBarButtonsToRemove: ["toImage"],
      // responsive: true
    };
  }

  get playIcon() {
    if (this.isAnimationPlaying) {
      return "pause_circle_filled";
    } else {
      return "play_circle_filled";
    }
  }

  /**
   * returns a single point timeseries to mark the selected year ranging from ymin to ymax
   */
  get yearSelectedSeries() {
    let x = [];
    let y = [];
    if (!_.isNull(this.yearSelected)) {
      x = [this.yearSelected, this.yearSelected];
      // a bounds single pass function would be more efficient
      y = [_.min(this.traces[0].y), _.max(this.traces[0].y)];
    }
    return { x, y, type: "scatter" };
  }

  get canHandleTimeSeriesRequest() {
    return this.$api().dataset.canHandleTimeSeriesRequest;
  }

  get hasTimeSeries() {
    return this.traces[0].x.length > 0;
  }

  /**
   * FIXME: should refactor
   * Returns analysis store's time series if displayTransformedTimeSeries = true
   * otherwise returns the dataset store's time series
   */
  get timeSeriesData() {
    return this.yearSelected
      ? this.traces.concat([this.yearSelectedSeries])
      : this.traces;
  }

  get totalCellArea() {
    return this.$api().dataset.totalCellAreaInSquareKm;
  }

  get numberOfCells() {
    return this.$api().dataset.numberOfCells;
  }

  get timeseriesRequestData() {
    return this.$api().dataset.timeSeriesRequestData;
  }

  async mounted() {
    await loadTimeSeries(this.$api());
    this.formTemporalRange = _.cloneDeep(this.selectedTemporalRange);
    this.timeSeriesUnwatcher = this.$watch(
      "timeseriesRequestData",
      async function (data) {
        await retrieveTimeSeries(this.$api(), data);
      }
    );
  }

  destroyed() {
    if (this.timeSeriesUnwatcher) {
      this.timeSeriesUnwatcher();
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
    this.$emit("yearSelected", year);
  }

  setTemporalRange() {
    this.selectedTemporalRange = _.cloneDeep(this.formTemporalRange);
    if (this.yearSelected == null) {
      return;
    }
    if (this.yearSelected < this.temporalRangeMin) {
      this.setYear(this.temporalRangeMin);
    } else if (this.yearSelected > this.temporalRangeMax) {
      this.setYear(this.temporalRangeMax);
    }
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
  getTimeSeriesData(timeSeriesData) {
    if (this.$refs.plot) {
      this.$refs.plot.update(timeSeriesData, this.layoutMetadata);
    }
  }

  @Watch("layoutMetadata")
  getLayoutMetadata(layoutMetadata) {
    if (this.$refs.plot) {
      this.$refs.plot.update(this.timeSeriesData, layoutMetadata);
    }
  }
}
export default TimeSeriesPlot;
</script>
<style>
.timeseries {
  height: 100%;
}
</style>
