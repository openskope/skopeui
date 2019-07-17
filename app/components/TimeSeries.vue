<template>
  <no-ssr placeholder="Loading...">
    <Plotly :data="traces" :layout="metadata" :options="options"></Plotly>
  </no-ssr>
</template>

<script>
import Vue from 'vue'
import _ from 'lodash'
import Component from 'nuxt-class-component'
import * as queryString from 'query-string'
import { Prop, Watch } from 'vue-property-decorator'
import { TIMESERIES_ENDPOINT } from '../store/constants'
const Plotly = () => import('@statnett/vue-plotly')

export default
@Component({
  components: {
    Plotly
  }
})
class TimeSeries extends Vue {
  @Prop()
  geometry

  @Prop()
  datasetUri

  @Prop()
  variableName

  timeseries = {
    x: [],
    y: [],
    type: 'scatter'
  }

  async updateDataset(geometry) {
    const qs = {
      start: '0001',
      end: '2017',
      timeResolution: 'year',
      timeZero: '0'
    }
    const body = {
      boundaryGeometry: geometry
    }
    const url = `${TIMESERIES_ENDPOINT}${
      this.datasetUri
    }?${queryString.stringify(qs)}`
    const res = await this.$axios.$post(url, body)
    const timeseries = {
      x: _.range(res.startIndex, res.endIndex + 1),
      y: res.values,
      type: 'scatter'
    }
    this.timeseries = timeseries
  }

  mounted() {
    this.updateDataset(this.geometry)
  }

  @Watch('geometry')
  onGeometryChange(geometry) {
    this.updateDataset(geometry)
  }

  get traces() {
    return [this.timeseries]
  }

  get metadata() {
    return {
      xaxis: {
        title: 'Year'
      },
      yaxis: {
        title: this.variableName
      },
      margin: {
        l: 60,
        r: 10,
        b: 60,
        t: 10,
        pad: 4
      }
    }
  }

  get options() {
    return {}
  }
}
</script>
