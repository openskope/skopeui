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
import { Prop, Watch } from 'vue-property-decorator'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Plotly } from 'vue-plotly'
const { Parser } = require('json2csv')

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

  mounted() {
    this.updateTimeSeries({})
  }

  async updateTimeSeries(options) {
    const opts = {
      datasetUri: this.datasetUri,
      geometry: this.geometry,
      minYear: this.minYear,
      maxYear: this.maxYear,
      zeroYearOffset: this.timeZero,
      ...options,
    }
    console.log(opts)
    await this.$api().dataset.retrieveTimeSeries(opts)
  }

  @Watch('datasetUri')
  onDatasetUriChange(datasetUri) {
    this.updateTimeSeries({ datasetUri })
  }

  @Watch('geometry')
  onGeometryChange(geometry) {
    this.updateTimeSeries({ geometry })
  }

  @Watch('minYear')
  onMinYearChange(minYear) {
    this.updateTimeSeries({ minYear })
  }

  @Watch('maxYear')
  onMaxYearChange(maxYear) {
    this.updateTimeSeries({ maxYear })
  }

  get hasData() {
    return this.$store.state.dataset.hasData
  }

  get isLoadingData() {
    return this.$store.state.dataset.isLoadingData
  }

  get timeseries() {
    const { x, y } = this.$store.state.dataset.timeseries
    return {
      x,
      y,
      type: 'scatter',
    }
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
