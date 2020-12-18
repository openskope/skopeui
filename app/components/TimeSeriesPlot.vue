<template>
  <client-only placeholder="Loading...">
    <Plotly
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

  get layoutMetadata() {
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
        title: 'Year',
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

  mounted() {}
}
export default TimeSeriesPlot
</script>
