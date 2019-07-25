<template>
  <no-ssr placeholder="Loading...">
    <div style="width: 100%">
      <Plotly ref="plot" :data="traces" :layout="metadata" :options="options">
      </Plotly>
      <v-btn @click.native="download">Download Chart</v-btn>
    </div>
  </no-ssr>
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

  async updateDataset(datasetUri, geometry) {
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
    this.updateDataset(this.datasetUri, this.geometry)
  }

  @Watch('datasetUri')
  onDatasetUriChange(datasetUri) {
    this.updateDataset(datasetUri, this.geometry)
  }

  @Watch('geometry')
  onGeometryChange(geometry) {
    this.updateDataset(this.datasetUri, geometry)
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
    return {}
  }
}
</script>
