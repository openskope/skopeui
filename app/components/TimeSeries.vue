<template>
  <client-only placeholder="Loading...">
    <div style="width: 100%">
      <Plotly
        v-if="requestMessage.length === 0"
        ref="plot"
        :data="traces"
        :layout="metadata"
        :options="options"
      ></Plotly>
      <v-alert v-else type="error">{{ requestMessage }}</v-alert>
      <v-btn @click.native="download">Download Chart</v-btn>
    </div>
  </client-only>
</template>

<script>
import Vue from 'vue'
import _ from 'lodash'
import { Component } from 'nuxt-property-decorator'
import * as queryString from 'query-string'
import { Prop, Watch } from 'vue-property-decorator'
import { TIMESERIES_ENDPOINT } from '@/store/constants'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
const Plotly = () => import('@statnett/vue-plotly')
const { Parser } = require('json2csv')

// Would need to make a custom debounce decorator so
// that debounced methods can exist in a vue-class-component
//
// Could use or take from https://github.com/bvaughn/debounce-decorator
const updateDataset = _.debounce(async function (
  vue,
  datasetUri,
  geometry,
  minYear,
  maxYear
) {
  const start = minYear.toString().padStart(4, '0')
  const end = maxYear.toString().padStart(4, '0')
  if (start > end) {
    vue.$store.dispatch(
      'info',
      'Please select a start year before the end year'
    )
    return
  }
  const qs = {
    start: start,
    end: end,
    timeResolution: 'year',
    timeZero: vue.timeZero,
  }
  const body = {
    boundaryGeometry: geometry,
  }
  const url = `${TIMESERIES_ENDPOINT}${datasetUri}?${queryString.stringify(qs)}`

  try {
    const response = await vue.$axios.$post(url, body)
    const timeZeroOffset = vue.timeZero
    const timeseries = {
      x: _.range(
        response.startIndex + timeZeroOffset,
        response.endIndex + timeZeroOffset + 1
      ),
      y: response.values,
      type: 'scatter',
    }
    vue.timeseries = timeseries
    console.log('Clearing messages')
    vue.$store.dispatch('clearMessages')
  } catch (e) {
    console.error(e)
    vue.$store.dispatch(
      'error',
      'Unable to load data from the timeseries service, please try selecting a smaller area or contact us if the error persists.'
    )
  }
},
300)

@Component({
  components: {
    Plotly,
  },
})
class TimeSeries extends Vue {
  @Prop()
  minYear

  @Prop()
  maxYear

  @Prop()
  geometry

  @Prop()
  datasetUri

  @Prop()
  variableName

  @Prop()
  timeZero

  timeseries = {
    x: [],
    y: [],
    type: 'scatter',
  }

  requestMessage = ''

  mounted() {
    updateDataset(
      this,
      this.datasetUri,
      this.geometry,
      this.minYear,
      this.maxYear
    )
  }

  @Watch('datasetUri')
  onDatasetUriChange(datasetUri) {
    updateDataset(this, datasetUri, this.geometry, this.minYear, this.maxYear)
  }

  @Watch('geometry')
  onGeometryChange(geometry) {
    updateDataset(this, this.datasetUri, geometry, this.minYear, this.maxYear)
  }

  @Watch('minYear')
  onMinYearChange(minYear) {
    updateDataset(this, this.datasetUri, this.geometry, minYear, this.maxYear)
  }

  @Watch('maxYear')
  onMaxYearChange(maxYear) {
    updateDataset(this, this.datasetUri, this.geometry, this.minYear, maxYear)
  }

  get geometryGeoJSON() {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: this.geometry,
        },
      ],
    }
  }

  async download() {
    const fields = ['Year', this.variableName]
    const data = _.zipWith(this.timeseries.x, this.timeseries.y, (x, y) => ({
      Year: x,
      [this.variableName]: y,
    }))
    const json2csvParser = new Parser({ fields })
    const csv = json2csvParser.parse(data)

    const zip = new JSZip()
    const dirname = _.kebabCase(this.datasetUri)
    const dir = zip.folder(dirname)

    const b64toBlob = async (url) => {
      const response = await fetch(url)
      return response.blob()
    }

    dir.file('time-series.csv', csv)
    dir.file('chart.png', b64toBlob(await this.$refs.plot.toImage()))
    dir.file(
      'chart.svg',
      b64toBlob(await this.$refs.plot.toImage({ format: 'svg' }))
    )
    dir.file('boundary.geojson', JSON.stringify(this.geometryGeoJSON))
    zip
      .generateAsync({ type: 'blob' })
      .then((content) => saveAs(content, `${_.kebabCase(this.datasetUri)}.zip`))
  }

  get traces() {
    return [this.timeseries]
  }

  get metadata() {
    return {
      xaxis: {
        title: 'Year',
      },
      yaxis: {
        title: this.variableName,
      },
      margin: {
        l: 60,
        r: 10,
        b: 60,
        t: 10,
        pad: 4,
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
export default TimeSeries
</script>
