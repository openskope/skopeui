<template>
  <v-responsive height="100%" width="100%">
    <LoadingSpinner v-if="isLoading" />
    <template v-else>
      <v-row class="d-flex flex-column" style="height: 100%">
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
          <v-spacer></v-spacer>
          <v-btn
            depressed
            color="accent"
            :disabled="!hasValidStudyArea"
            @click="goToAnalyze($route.params.id)"
            >Go to Analyze
            <v-icon small class="ml-2" color="white"
              >fas fa-chevron-right</v-icon
            ></v-btn
          >
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
        <!-- map + time series plot -->
        <v-col
          class="flex-grow-1 flex-shrink-0 ma-0 pa-0"
          style="background-color: blue"
        >
          <v-row class="mx-5" style="height: 100%">
            <!-- loading animation -->
            <v-col v-if="isLoadingData">
              <v-progress-circular
                v-if="isLoadingData"
                indeterminate
                color="primary"
              />
            </v-col>
            <!-- map and toolbar controls-->
            <template v-else>
              <!-- map -->
              <v-col style="height: 100%">
                <Map />
              </v-col>
              <!-- time series plot -->
              <v-col style="height: 100%">
                <v-card height="85%" elevation="2" outlined>
                  <h1 class="headline mt-3 ml-3">Time Series</h1>
                  <template v-if="hasTimeSeries">
                    <TimeSeriesPlot
                      :time-series="timeSeries"
                      :year-selected="yearSelected"
                      @yearSelected="setYear"
                    />
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
                            <v-btn
                              icon
                              class="mt-2"
                              color="secondary"
                              @click="gotoFirstYear"
                            >
                              <v-icon>skip_previous</v-icon>
                            </v-btn>
                            <v-btn
                              icon
                              class="mt-2"
                              color="secondary"
                              @click="previousYear"
                            >
                              <v-icon>arrow_left</v-icon>
                            </v-btn>
                            <v-btn-toggle icon class="my-auto">
                              <v-btn icon @click="togglePlay">
                                <v-icon color="secondary">{{
                                  playIcon
                                }}</v-icon>
                              </v-btn>
                            </v-btn-toggle>
                            <v-btn
                              icon
                              class="mt-2"
                              color="secondary"
                              @click="nextYear"
                            >
                              <v-icon>arrow_right</v-icon>
                            </v-btn>
                            <v-btn
                              icon
                              class="mt-2"
                              color="secondary"
                              @click="gotoLastYear"
                            >
                              <v-icon>skip_next</v-icon>
                            </v-btn>
                          </v-toolbar-items>
                        </v-col>
                      </v-row>
                    </v-toolbar>
                  </template>
                  <v-alert v-else color="warning">
                    A study area needs to be selected for a timeseries to be
                    displayed
                  </v-alert>
                </v-card>
              </v-col>
            </template>
          </v-row>
        </v-col>
      </v-row>
    </template>
  </v-responsive>
</template>

<script>
import { Component, Watch } from 'nuxt-property-decorator';
import Map from '@/components/Map.vue';
import Metadata from '@/components/action/Metadata.vue';
import TimeSeriesPlot from '@/components/TimeSeriesPlot.vue';
import Vue from 'vue';
import _ from 'lodash';
import {
  loadTimeSeries,
  retrieveTimeSeries,
  initializeDatasetGeoJson,
} from '@/store/actions';

const setYearSelected = _.debounce(function (vue) {
  vue.yearSelected = vue.formYearSelected;
}, 350);

@Component({
  layout: 'BaseDataset',
  components: {
    Map,
    TimeSeriesPlot,
    Metadata,
  },
})
class Visualize extends Vue {
  animationSpeed = 2000;
  hasData = false;
  isAnimationPlaying = false;
  isLoadingData = true;
  opacityIndex = 3;
  opacityLevels = _.range(0, 10).map((x) => x * 10);
  yearSelected = 1500;
  dialog = false;
  instructions = false;
  layerGroup = {
    icon: 'fas fa-layer-group',
  };
  timeSeriesUnwatcher = null;
  stepNames = _.clone(this.$api().app.stepNames);
  formTemporalRange = [1, 2017];
  formYearSelected = 1500;
  selectedTemporalRange = [1, 2017];

  get geometry() {
    return this.$api().dataset.geoJson?.geometry ?? null;
  }

  get metadata() {
    return this.$api().dataset.metadata;
  }

  get timespan() {
    return this.$api().dataset.timespan;
  }

  get canHandleTimeSeriesRequest() {
    return this.$api().dataset.canHandleTimeSeriesRequest;
  }

  get isLoading() {
    return _.isNull(this.metadata);
  }

  get currentStep() {
    return this.stepNames.findIndex((x) => x === this.$route.name);
  }
  get hasValidStudyArea() {
    // return whether study area geometry has been defined
    return this.currentStep === 0 || this.$api().dataset.hasGeoJson;
  }

  get hasTimeSeries() {
    return this.timeSeries.x.length > 0;
  }
  get timeSeries() {
    const api = this.$api();
    const timeseries = api.dataset.timeseries;
    if (timeseries.x.length > 0) {
      const minOffset = this.selectedTemporalRange[0] - this.minYear;
      const maxOffset = this.selectedTemporalRange[1] - this.minYear;
      const x = timeseries.x.slice(minOffset, maxOffset);
      const y = timeseries.y.slice(minOffset, maxOffset);
      console.log({ x, y });
      return { x, y, type: 'scatter' };
    } else {
      return { x: [], y: [], type: 'scatter' };
    }
  }
  get minYear() {
    return parseInt(this.metadata.timespan.period.gte);
  }
  get maxYear() {
    return parseInt(this.metadata.timespan.period.lte);
  }
  get opacity() {
    return this.opacityLevels[this.opacityIndex];
  }
  get playIcon() {
    if (this.isAnimationPlaying) {
      return 'pause_circle_filled';
    } else {
      return 'play_circle_filled';
    }
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

  async fetch() {
    const api = this.$api();
    await api.dataset.loadMetadata(this.$route.params.id);
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
        console.log({ data });
        await retrieveTimeSeries(this.$api(), data);
      }
    );
    this.yearSelected = this.minYear;
    this.isLoadingData = false;
    this.hasData = true;
  }
  destroyed() {
    this.timeSeriesUnwatcher();
  }

  goToAnalyze(id) {
    if (_.isUndefined(id)) {
      return;
    }
    this.$router.push({ name: 'dataset-id-analyze', params: { id } });
  }

  decreaseOpacity() {
    this.opacityIndex = _.clamp(this.opacityIndex - 1, 0, 10);
  }
  increaseOpacity() {
    this.opacityIndex = _.clamp(this.opacityIndex + 1, 0, 10);
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

  setYear(year) {
    this.yearSelected = year;
  }
}
export default Visualize;
</script>

<style scoped>
.map-flex {
  height: calc(70vh - 96px);
}
.timeseries-flex {
  height: calc(70vh - 96px);
}
@media all and (max-width: 960px) {
  .map-flex {
    height: 400px;
  }
  .timeseries-flex {
    height: 400px;
  }
}
@media all and (max-width: 600px) {
  .map-flex {
    height: 350px;
  }
  .timeseries-flex {
    height: 350px;
  }
}
.v-toolbar__title {
  color: #fb7a2c;
  text-transform: uppercase;
  font-size: 1rem;
  font-weight: bold;
}
.v-toolbar__items {
  margin-top: 0.5rem;
}
</style>
