<template>
  <v-container>
    <v-row class="my-5">
      <h2 class="mx-3">
        {{ selectedDataset.title }}
      </h2>
    </v-row>
    <v-row dense align-content-start justify-space-around wrap>
      <v-col cols="9">
        <TimeSeriesPlot class="timeseries-flex" :time-series="timeSeries" />
      </v-col>
      <v-col cols="3">
        <v-card flat outlined>
          <v-card-title class="secondary">Series</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import TimeSeriesPlot from '@/components/TimeSeriesPlot.vue'
import Vue from 'vue'
import { Component } from 'nuxt-property-decorator'
import { namespace } from 'vuex-class'

const Datasets = namespace('datasets')
@Component({
  layout: 'BaseDataset',
  components: {
    TimeSeriesPlot,
  },
})
class Analyze extends Vue {
  @Datasets.State('selectedDataset')
  selectedDataset

  get timeSeries() {
    const timeseries = this.$api().dataset.timeseries
    if (timeseries.x.length > 0) {
      return { ...this.$api().dataset.timeseries, type: 'scatter' }
    } else {
      return { x: [], y: [], type: 'scatter' }
    }
  }

  async created() {
    console.log(this.$route.params.action)
  }
}
export default Analyze
</script>

<style scoped>
.timeseries-flex {
  height: calc(70vh - 96px);
}
@media all and (max-width: 960px) {
  .timeseries-flex {
    height: 400px;
  }
}
@media all and (max-width: 600px) {
  .timeseries-flex {
    height: 350px;
  }
}
</style>
