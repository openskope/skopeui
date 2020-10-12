<template>
  <client-only placeholder="Loading...">
    <div style="width: 100%">
      <div v-if="isLoadingData" class="justify-center">
        <v-progress-circular
          v-if="isLoadingData"
          indeterminate
          color="primary"
        />
        Loading . . .
      </div>
      <div v-else-if="hasData">
        <Plotly
          ref="plot"
          :data="timeseriesData"
          :layout="layoutMetadata"
          :options="options"
        ></Plotly>
        <v-btn @click.native="download">Download Chart</v-btn>
      </div>
      <v-alert v-else type="error"
        >Sorry, we couldn't build a graph from the given parameters.</v-alert
      >
    </div>
  </client-only>
</template>

<script>
import Vue from 'vue'
import _ from 'lodash'
import { Component } from 'nuxt-property-decorator'
import * as queryString from 'query-string'
import { Prop, Watch } from 'vue-property-decorator'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Plotly } from 'vue-plotly'
const { Parser } = require('json2csv')
import { TIMESERIES_ENDPOINT } from '@/store/constants'

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
  vue.isLoadingData = true
  const start = minYear.toString().padStart(4, '0')
  const end = maxYear.toString().padStart(4, '0')
  if (start > end) {
    vue.$api().messages.info('Please select a start year before the end year')
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
    vue.hasData = true
    vue.$api().messages.clearMessages()
  } catch (e) {
    vue.$api().messages.clearMessages()
    vue.hasData = false
    let errorMessage =
      'Unable to load data from the timeseries service, please try selecting a smaller area or contact us if the error persists.'
    if (e.response) {
      console.error('received error response from server: ', e)
      const responseData = e.response.data
      if (responseData.status === 400) {
        // bad request
        errorMessage = responseData.message
      }
    } else if (e.request) {
      // browser made a request but didn't see a response, likely a timeout / client network error
      console.log('did not receive a server response: ', { e })
      errorMessage += ` Cause: ${e.message}`
    }
    vue.$api().messages.error(errorMessage)
  }
  vue.isLoadingData = false
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

  hasData = false
  isLoadingData = false

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

  get timeseriesData() {
    return [this.timeseries]
  }

  get layoutMetadata() {
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
