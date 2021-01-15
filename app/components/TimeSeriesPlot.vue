<template>
  <client-only placeholder="Loading...">
    <Plotly
      class="timeseries"
      ref="plot"
      :data="timeSeriesData"
      :layout="layoutMetadata"
      :options="options"
      @click="setYear"
    ></Plotly>
  </client-only>
</template>

<script>
import Vue from 'vue'
import _ from 'lodash'
import { Component } from 'nuxt-property-decorator'
import { Prop, Watch } from 'vue-property-decorator'

@Component({
  components: {
    Plotly: () => import('vue-plotly').then((p) => p.Plotly),
  },
})
class TimeSeriesPlot extends Vue {
  @Prop()
  timeSeries

  @Prop()
  yearSelected

  get variableName() {
    const api = this.$api()
    return _.isEmpty(api.dataset.layer) ? '' : api.dataset.layer.name
  }

  get layoutMetadata() {
    const xaxisTitle = `Year (currently ${
      _.isEmpty(this.yearSelected) ? `${this.yearSelected}CE` : 'None'
    })`
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
    }
  }

  get options() {
    return {
      modeBarButtonsToRemove: ['toImage'],
      // responsive: true
    }
  }

  get yearSelectedSeries() {
    if (!_.isNull(this.yearSelected)) {
      return {
        x: [this.yearSelected, this.yearSelected],
        y: [_.min(this.timeSeries.y), _.max(this.timeSeries.y)],
        type: 'scatter',
      }
    } else {
      return {
        x: [],
        y: [],
        type: 'scatter',
      }
    }
  }

  get timeSeriesData() {
    return this.yearSelectedSeries.x.length === 0
      ? [this.timeSeries]
      : [this.timeSeries, this.yearSelectedSeries]
  }

  setYear(data) {
    this.$emit('yearSelected', data.points[0].x)
  }

  @Watch('timeSeriesData')
  getTimeSeriesData(timeSeriesData) {
    this.$refs.plot.update(timeSeriesData, this.layoutMetadata)
  }

  @Watch('layoutMetadata')
  getLayoutMetadata(layoutMetadata) {
    if (this.$refs.plot) {
      this.$refs.plot.update(this.timeSeriesData, layoutMetadata)
    }
  }
}
export default TimeSeriesPlot
</script>
<style>
.timeseries {
  height: calc(100% - 48px);
}
</style>
