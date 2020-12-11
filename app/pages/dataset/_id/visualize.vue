<template>
  <client-only placeholder="Loading...">
    <div v-if="isLoadingData" class="justify-center">
      <v-progress-circular v-if="isLoadingData" indeterminate color="primary" />
    </div>
    <div v-else>
      <Plotly
        ref="plot"
        :data="timeSeriesData"
        :layout="layoutMetadata"
        :options="options"
        @click="setYear"
      >
      </Plotly>
    </div>
  </client-only>
</template>

<script>
import { Component } from 'nuxt-property-decorator'
import Vue from 'vue'

@Component({
  layout: 'dashboard',
  components: {
    Plotly: () => import('vue-plotly').then((vp) => vp.Plotly),
  },
})
class Visualize extends Vue {
  isLoadingData = true
  hasData = false
  hasInitializedPlotly = false

  yearSeries = {
    x: [],
    y: [],
    type: 'scatter',
  }

  timeSeries = {
    x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    y: [0.5, 0.4, 0.6, 0.55, 0.54, 0.64, 0.31, 0.24, 0.33, 0.67],
    type: 'scatter',
  }

  mounted() {
    this.isLoadingData = false
    this.hasData = true
  }

  setYear(data) {
    let x = data.points[0].x
    x = [x, x]
    const y = [_.min(this.timeSeries.y), _.max(this.timeSeries.y)]
    this.yearSeries.x.splice(0, this.yearSeries.x.length, ...x)
    this.yearSeries.y.splice(0, this.yearSeries.y.length, ...y)
    this.$refs.plot.update(this.timeSeriesData, this.layoutMetadata)
  }

  get timeSeriesData() {
    return this.yearSeries.x.length === 0
      ? [this.timeSeries]
      : [this.timeSeries, this.yearSeries]
  }

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
}

export default Visualize
</script>
