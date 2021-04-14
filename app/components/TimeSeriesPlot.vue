<template>
  <v-card class="flex-grow-1" elevation="2" outlined>
    <v-card-title>Time Series</v-card-title>
    <v-card-text v-if="hasTimeSeries">
      <client-only placeholder="Loading...">
        <Plotly
          ref="plot"
          class="timeseries"
          :data="timeSeriesData"
          :layout="layoutMetadata"
          :options="options"
          @click="setYear"
        ></Plotly>
      </client-only>
      <v-toolbar flat extended extension-height="25" class="pt-8">
        <v-row>
          <v-col cols="4">
            <v-toolbar-items class="my-auto">
              <v-text-field
                v-model="formTemporalRange[0]"
                class="mt-0 pt-3"
                label="Min Year"
                hide-details
                type="number"
                style="width: 60px"
              ></v-text-field>
              <v-spacer />
              <v-text-field
                v-model="formTemporalRange[1]"
                class="mt-0 pt-3"
                label="Max Year"
                hide-details
                type="number"
                style="width: 60px"
              ></v-text-field>
              <v-spacer />
              <v-btn
                class="mt-1 py-3"
                color="secondary"
                @click="setTemporalRange"
              >
                Update
              </v-btn>
            </v-toolbar-items>
          </v-col>
          <v-col cols="4">
            <v-toolbar-items>
              <v-btn icon class="mt-2" color="secondary" @click="gotoFirstYear">
                <v-icon>skip_previous</v-icon>
              </v-btn>
              <v-btn icon class="mt-2" color="secondary" @click="previousYear">
                <v-icon>arrow_left</v-icon>
              </v-btn>
              <v-btn-toggle icon class="my-auto">
                <v-btn icon @click="togglePlay">
                  <v-icon color="secondary">{{ playIcon }}</v-icon>
                </v-btn>
              </v-btn-toggle>
              <v-btn icon class="mt-2" color="secondary" @click="nextYear">
                <v-icon>arrow_right</v-icon>
              </v-btn>
              <v-btn icon class="mt-2" color="secondary" @click="gotoLastYear">
                <v-icon>skip_next</v-icon>
              </v-btn>
            </v-toolbar-items>
          </v-col>
        </v-row>
      </v-toolbar>
    </v-card-text>
    <v-alert v-else color="warning">
      Please select a study area to display a timeseries.
    </v-alert>
  </v-card>
</template>

<script>
import Vue from "vue";
import _ from "lodash";
import { Component } from "nuxt-property-decorator";
import { Prop, Watch } from "vue-property-decorator";
import { loadTimeSeries, retrieveTimeSeries } from "@/store/actions";

@Component({
  components: {
    Plotly: () => import("vue-plotly").then((p) => p.Plotly),
  },
})
class TimeSeriesPlot extends Vue {
  @Prop({ default: null })
  yearSelected;

  // "play" automatically advances the timeseries year
  animationSpeed = 2000;
  isAnimationPlaying = false;

  formTemporalRange = [1, 2017];
  formYearSelected = 1500;
  selectedTemporalRange = [1, 2017];

  timeSeriesUnwatcher = null;

  get timeSeries() {
    const api = this.$api();
    const timeseries = api.dataset.timeseries;
    if (timeseries.x.length > 0) {
      const minOffset = this.selectedTemporalRange[0] - this.minYear;
      const maxOffset = this.selectedTemporalRange[1] - this.minYear;
      const x = timeseries.x.slice(minOffset, maxOffset);
      const y = timeseries.y.slice(minOffset, maxOffset);
      console.log({ x, y });
      return { x, y, type: "scatter" };
    } else {
      return { x: [], y: [], type: "scatter" };
    }
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
    return parseInt(this.metadata.timespan.period.gte);
  }

  get maxYear() {
    return parseInt(this.metadata.timespan.period.lte);
  }

  get variable() {
    return this.$api().dataset.variable;
  }

  get layoutMetadata() {
    const xaxisTitle = !_.isNil(this.yearSelected)
      ? `Year (currently ${this.yearSelected})`
      : "Year";
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

  get yearSelectedSeries() {
    if (!_.isNull(this.yearSelected)) {
      return {
        x: [this.yearSelected, this.yearSelected],
        y: [_.min(this.timeSeries.y), _.max(this.timeSeries.y)],
        type: "scatter",
      };
    } else {
      return {
        x: [],
        y: [],
        type: "scatter",
      };
    }
  }

  get canHandleTimeSeriesRequest() {
    return this.$api().dataset.canHandleTimeSeriesRequest;
  }

  get hasTimeSeries() {
    return this.timeSeries.x.length > 0;
  }

  get timeSeriesData() {
    return this.yearSelectedSeries.x.length === 0
      ? [this.timeSeries]
      : [this.timeSeries, this.yearSelectedSeries];
  }

  async mounted() {
    await loadTimeSeries(this.$api());
    this.timeSeriesUnwatcher = this.$watch(
      function () {
        if (this.canHandleTimeSeriesRequest) {
          return {
            datasetId: this.metadata.id,
            variableId: this.variable.id,
            geometry: this.geometry,
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
        console.log("retrieving time series");
        console.log({ data });
        await retrieveTimeSeries(this.$api(), data);
      }
    );
  }
  destroyed() {
    this.timeSeriesUnwatcher();
  }

  setYear(data) {
    this.$emit("yearSelected", data.points[0].x);
  }

  setTemporalRange() {
    this.selectedTemporalRange = _.cloneDeep(this.formTemporalRange);
  }

  gotoFirstYear() {
    if (this.variable === null) {
      return;
    }
    this.setYear(this.minYear);
  }
  gotoLastYear() {
    if (this.variable === null) {
      return;
    }
    this.setYear(this.maxYear);
  }
  nextYear() {
    if (this.variable === null) {
      return;
    }
    this.setYear(_.clamp(this.yearSelected + 1, this.minYear, this.maxYear));
  }
  previousYear() {
    if (this.variable === null) {
      return;
    }
    this.setYear(_.clamp(this.yearSelected - 1, this.minYear, this.maxYear));
  }
  togglePlay(event) {
    this.isAnimationPlaying = !this.isAnimationPlaying;
    if (this.isAnimationPlaying) {
      // start an interval
      const animationInterval = setInterval(() => {
        if (!this.isAnimationPlaying) {
          clearInterval(animationInterval);
          return;
        }
        this.nextYear();
      }, this.animationSpeed);
    }
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
  height: calc(100% - 48px);
}
</style>
