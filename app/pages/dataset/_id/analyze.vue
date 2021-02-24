<template>
  <v-responsive :aspect-ratio="16 / 9">
    <!-- title and instructions -->
    <v-row class="my-5">
      <h1 class="ml-5 my-auto font-weight-light">
        {{ selectedDataset.title }}
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
          <v-card-title class="accent">Metadata</v-card-title>
          <v-card-text><Metadata /></v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- dismissable instructions -->
    <v-row>
      <v-col class="mx-auto">
        <v-alert
          v-model="instructions"
          color="secondary"
          text
          outlined
          dismissible
        >
          For the geometry of your study area, you can modify the opacity and
          variable layer. The Time Series chart will automatically update upon
          selecting a layer. After you are finished, you can continue to the
          analysis step.
        </v-alert>
      </v-col>
    </v-row>
    <!-- time series -->

    <v-row dense align-content-start justify-space-around wrap>
      <v-col cols="9">
        <v-card class="pa-3" elevation="2" outlined shaped>
          <v-card-title><h1 class="headline">Time Series</h1></v-card-title>
          <TimeSeriesPlot class="timeseries-flex" :time-series="timeSeries" />
        </v-card>
      </v-col>
      <!-- analysis controls -->
      <v-col cols="3">
        <v-card elevation="2" color="primary">
          <v-card-title>
            <h1 class="headline white--text">Analysis</h1>
          </v-card-title>
          <v-form>
            <v-row
              no-gutters
              :style="'background-color: white'"
              class="outlined"
            >
              <v-col class="outlined" cols="4">
                <h3 class="ma-3 title">Selected area</h3>
                <v-row class="mx-3 my-2">
                  <p class="subtitle">
                    {{ selectedAreaInSquareKilometers }} km<sup>2</sup>
                  </p>
                </v-row>
                <v-row class="mx-3">
                  <span class="my-1">
                    <h3 class="title-2">Pixels</h3>
                    <p>45.8 km<sup>2</sup> (88 pixels)</p>
                  </span>
                </v-row>
                <v-btn
                  small
                  block
                  depressed
                  color="accent"
                  @click="goToStudyArea($route.params.id)"
                  >Edit</v-btn
                >
              </v-col>
              <v-col class="outlined" cols="8">
                <h3 class="ma-3 title">Selected variable</h3>
                <v-select
                  v-model="layer"
                  label="Select a variable"
                  item-color="accent"
                  color="accent"
                  dense
                  :items="layers"
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
            <!-- temporal range -->
            <v-row
              no-gutters
              :style="'background-color: white'"
              class="outlined end-section"
            >
              <h3 class="ma-3 title">Temporal range</h3>
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

            <!-- select mean | median -->
            <v-row
              no-gutters
              :style="'background-color: white'"
              class="outlined end-section"
            >
              <h3 class="mx-3 my-2 title">
                For each Year step, selected area is summarized as the:
              </h3>
              <v-radio-group row mandatory class="mx-3">
                <v-radio color="accent" label="Mean" value="mean"></v-radio>
                <v-radio color="accent" label="Median" value="median"></v-radio>
                <p class="my-auto">of its pixels</p>
              </v-radio-group>
            </v-row>
            <!-- stats for temporal interval -->
            <v-row
              no-gutters
              :style="'background-color: white'"
              class="outlined end-section"
            >
              <h3 class="mx-3 my-2 title">
                Statistics for the Temporal Interval
              </h3>
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
            <!-- smoothing -->
            <v-row
              no-gutters
              :style="'background-color: white'"
              class="outlined end-section"
            >
              <h3 class="mx-3 my-2 title">Smoothing</h3>
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
                    <v-radio label="Spline smoothing" value="spline"></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-row>
            <!-- display -->
            <v-row
              no-gutters
              :style="'background-color: white'"
              class="outlined"
            >
              <h3 class="mx-3 my-2 title">Display</h3>
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
    </v-row>
  </v-responsive>
</template>

<script>
import Metadata from '@/components/action/Metadata.vue'
import KernelRegression from '@/components/chart-form/KernelRegression.vue'
import RunningAverage from '@/components/chart-form/RunningAverage.vue'
import TimeSeriesPlot from '@/components/TimeSeriesPlot.vue'
import Metadata from '@/components/action/Metadata.vue'
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import { namespace } from 'vuex-class'
import _ from 'lodash'

const AnalyzeNS = namespace('analyze')
const Datasets = namespace('datasets')
const Dataset = namespace('dataset')
@Component({
  layout: 'BaseDataset',
  components: {
    Metadata,
    KernelRegression,
    RunningAverage,
    TimeSeriesPlot,
    Metadata,
  },
})
class Analyze extends Vue {
  @AnalyzeNS.State('response')
  response

  @Datasets.State('selectedDataset')
  selectedDataset

  @Dataset.State('layer')
  selectedLayer

  @Dataset.State('geometry')
  selectedStudyArea

  dialog = false
  instructions = false

  layerGroup = {
    icon: 'fas fa-layer-group',
  }

  polygon = {
    icon: 'fas fa-draw-polygon',
  }

  smoothing = null
  display = null
  dialog = false
  instructions = false

  set layer(l) {
    l = this.layers.find((layer) => layer.id === l)
    this.$api().datasets.selectVariable(l.id)
    this.$api().dataset.setLayer(l)
  }
  get layer() {
    if (_.size(this.layers) > 1) return ''
    else return this.$api().dataset.layer
  }
  get layers() {
    return this.selectedDataset.variables
  }

  set selectedLayer(layer) {
    this.$api().dataset.setLayer(layer)
  }

  selectedZonalStatistic = 'mean'

  zonalStatisticOpts = [
    {
      label: 'Mean',
      id: 'mean',
    },
    {
      label: 'Median',
      id: 'median',
    },
  ]

  timeRange = {
    lb: {
      year: 1500,
      month: 1,
    },
    ub: {
      year: 1800,
      month: 1,
    },
  }

  selectedSmoother = 'none'

  smootherOpts = [
    {
      label: 'None',
      id: 'none',
    },
    {
      label: 'Moving Average (Trailing)',
      id: 'trailingAverage',
    },
    {
      label: 'Moving Average (Centered)',
      id: 'centeredAverage',
    },
    {
      label: 'Polynomial Spline',
      id: 'polynomialSpline',
    },
  ]

  width = 7

  selectedScaleTransform = 'none'

  scaleTransformOpts = [
    {
      label: 'None',
      id: 'none',
    },
    {
      label: 'Z-Score',
      id: 'zscore',
    },
  ]

  get smootherWidthLabel() {
    let widthUnit = 'Unknowns'
    switch (this.temporalResolution) {
      case 'month':
        widthUnit = 'Months'
        break
      case 'year':
        widthUnit = 'Years'
        break
    }
    return `Smoother Width (# of ${widthUnit})`
  }

  get temporalResolution() {
    return this.selectedDataset.timespan.resolution
  }

  get timeSeries() {
    const timeseries = this.$api().dataset.timeseries
    if (timeseries.x.length > 0) {
      return { ...this.$api().dataset.timeseries, type: 'scatter' }
    } else {
      return { x: [], y: [], type: 'scatter' }
    }
  }

  get selectedAreaInSquareKilometers() {
    return (this.$api().dataset.selectedAreaInSquareMeters / 1000000.0).toFixed(
      2
    )
  }

  async submit() {
    console.log('submitting to web service')
    await this.$api().analyze.retrieveAnalysis({
      dataset_id: 'lbda-v2',
      variable_id: 'palmer_modified_drought_index',
      selected_area: this.selectedStudyArea,
      zonal_statistic: 'mean',
      transforms: [],
      time_range: {
        gte: 1500,
        lte: 1800,
      },
    })
  }

  async created() {
    console.log(this.$route.params.action)
  }

  goToStudyArea(id) {
    if (_.isUndefined(id)) {
      return
    }
    this.$router.push({ name: 'dataset-id', params: { id } })
  }
}
export default Analyze
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
