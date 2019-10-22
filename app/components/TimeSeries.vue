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
import Component from 'nuxt-class-component'
import * as queryString from 'query-string'
import { Prop, Watch } from 'vue-property-decorator'
import { TIMESERIES_ENDPOINT } from '../store/constants'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
const Plotly = () => import('@statnett/vue-plotly')
const { Parser } = require('json2csv')

// Would need to make a custom debounce decorator so
// that debounced methods can exist in a vue-class-component
//
// Could use or take from https://github.com/bvaughn/debounce-decorator
const updateDataset = _.debounce(async function(
  vue,
  datasetUri,
  geometry,
  minYear,
  maxYear
) {
  // this.isLoading = true
  const start = minYear.toString().padStart(4, '0')
  const end = maxYear.toString().padStart(4, '0')
  const qs = {
    start: start,
    end: end,
    timeResolution: 'year',
    timeZero: vue.timeZero
  }
  const body = {
    boundaryGeometry: geometry
  }
  const url = `${TIMESERIES_ENDPOINT}${datasetUri}?${queryString.stringify(qs)}`

  const res = await vue.$axios.$post(url, body)
  const timeseries = {
    x: _.range(res.startIndex, res.endIndex + 1),
    y: res.values,
    type: 'scatter'
  }
  vue.timeseries = timeseries
},
300)

export default
@Component({
  components: {
    Plotly
  }
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
    type: 'scatter'
  }

  requestMessage = ''
  isLoading = true

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
          geometry: this.geometry
        }
      ]
    }
  }

  async download() {
    const fields = ['Year', this.variableName]
    const data = _.zipWith(this.timeseries.x, this.timeseries.y, (x, y) => ({
      Year: x,
      [this.variableName]: y
    }))
    const json2csvParser = new Parser({ fields })
    const csv = json2csvParser.parse(data)

    const zip = new JSZip()
    const dirname = _.kebabCase(this.datasetUri)
    const dir = zip.folder(dirname)

    const b64toBlob = async url => {
      const res = await fetch(url)
      return res.blob()
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
      .then(content => saveAs(content, `${_.kebabCase(this.datasetUri)}.zip`))
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
    return {
      modeBarButtonsToRemove: ['toImage']
      // responsive: true
    }
  }
}
</script>
