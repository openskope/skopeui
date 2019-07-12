<template>
  <no-ssr placeholder="Loading...">
    <Plotly
      :data="traces"
      :layout="metadata"
      :display-mode-bar="false"
    ></Plotly>
  </no-ssr>
</template>

<script>
import Vue from 'vue'
import _ from 'lodash'
import Component from 'nuxt-class-component'
import * as queryString from 'query-string'
const Plotly = () => import('vue-plotly').then(p => p.Plotly)

export default
@Component({
  components: {
    Plotly
  }
})
class TimeSeries extends Vue {
  timeseries = {
    x: [],
    y: [],
    type: 'scatter'
  }

  async updateDataset() {
    const qs = {
      start: '0001',
      end: '2017',
      timeResolution: 'year',
      timeZero: '0'
    }
    const body = {
      boundaryGeometry: {
        coordinates: [-116, 35],
        type: 'point'
      }
    }
    const url = `https://app.openskope.org/timeseries-service/api/v1/timeseries/lbda-v2/palmer_modified_drought_index?${queryString.stringify(
      qs
    )}`
    const res = await this.$axios.$post(url, body)
    const timeseries = {
      x: _.range(res.startIndex, res.endIndex),
      y: res.values,
      type: 'scatter'
    }
    this.timeseries = timeseries
  }

  mounted() {
    this.updateDataset()
  }

  get traces() {
    return [this.timeseries]
  }

  get metadata() {
    return {
      title: 'Time Series'
    }
  }
}
</script>
