import _ from 'lodash'
import { TIMESERIES_ENDPOINT } from '@/store/modules/constants'
import * as queryString from 'query-string'
import {
  Module,
  VuexModule,
  Action,
  Mutation,
  MutationAction,
} from 'vuex-module-decorators'
import { API } from '@/plugins/store'
import Vue from 'vue'

// Would need to make a custom debounce decorator so
// that debounced methods can exist in a vue-class-component
//
// Could use or take from https://github.com/bvaughn/debounce-decorator
const updateDataset = _.debounce(async function (
  vuex,
  { datasetId, variableId, geometry, minYear, maxYear, zeroYearOffset }
) {
  console.log({ datasetId, variableId })
  const api = new API(vuex.store)
  api.dataset.setIsLoading(true)
  const start = minYear.toString().padStart(4, '0')
  const end = maxYear.toString().padStart(4, '0')
  if (start > end) {
    api.messages.info('Please select a start year before the end year')
    return
  }
  const body = {
    datasetId,
    variableName: variableId,
    start: start,
    end: end,
    timeResolution: 'year',
    timeZero: zeroYearOffset,
    boundaryGeometry: geometry,
  }
  const url = `${TIMESERIES_ENDPOINT}${datasetUri}`
  try {
    const response = await vuex.store.$axios.$post(url, body)
    const timeZeroOffset = zeroYearOffset
    const timeseries = {
      x: _.range(
        response.startIndex + timeZeroOffset,
        response.endIndex + timeZeroOffset + 1
      ),
      y: response.values,
    }
    api.messages.clearMessages()
    api.dataset.setTimeSeries(timeseries)
  } catch (e) {
    api.messages.clearMessages()
    api.dataset.clearTimeSeries()
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
    api.messages.error(errorMessage)
  }
  api.dataset.setIsLoading(false)
},
300)

@Module({ stateFactory: true, name: 'dataset', namespaced: true })
class DataSet extends VuexModule {
  timeseries = {
    x: [],
    y: [],
  }
  metadata = null
  isLoadingData = false
  hasData = false
  geometry = { type: 'None', coordinates: [] }
  selectedAreaInSquareMeters = 0
  variable = null

  get timeZero() {
    if (this.metadata) {
      return this.metadata.timespan.period.timeZero || 0
    }
    return 0
  }

  get timespan() {
    if (this.metadata) {
      return [
        this.metadata.timespan.period.gte,
        this.metadata.timespan.period.lte,
      ]
    }
    console.log('No selected dataset, returning default year range')
    return [1, new Date().getFullYear()]
  }

  @Mutation
  setMetadata(metadata) {
    this.metadata = metadata
  }

  @Mutation
  setVariable(id) {
    for (const variable of this.metadata.variables) {
      variable.visible = variable.id === id
      if (variable.visible) {
        this.metadata.variable = variable
        Vue.set(this, 'selectedVariable', variable)
      }
    }
  }

  get hasGeometry() {
    return this.geometry.type != 'None'
  }

  @Mutation
  setIsLoading(value) {
    this.isLoadingData = value
  }

  @Mutation
  setGeometry({ geometry, area }) {
    Vue.set(this, 'geometry', geometry)
    this.selectedAreaInSquareMeters = area
  }

  @Mutation
  clearGeometry() {
    Vue.set(this, 'geometry', { type: 'None', coordinates: [] })
    this.selectedAreaInSquareMeters = 0
  }

  @Mutation
  setTimeSeries(timeseries) {
    this.hasData = true
    this.timeseries = timeseries
  }

  @Mutation
  clearTimeSeries() {
    this.hasData = false
    this.timeseries = {
      x: [],
      y: [],
    }
  }

  @Action
  retrieveTimeSeries({
    datasetId,
    variableId,
    geometry,
    minYear,
    maxYear,
    zeroYearOffset,
  }) {
    updateDataset(this, {
      datasetId,
      variableId,
      geometry,
      minYear,
      maxYear,
      zeroYearOffset,
    })
  }
}

export { DataSet }
