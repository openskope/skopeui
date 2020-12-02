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

// Would need to make a custom debounce decorator so
// that debounced methods can exist in a vue-class-component
//
// Could use or take from https://github.com/bvaughn/debounce-decorator
const updateDataset = _.debounce(async function (
  vuex,
  datasetUri,
  geometry,
  minYear,
  maxYear,
  zeroYearOffset
) {
  console.log({ vuex })
  const api = new API(vuex.store)
  api.dataset.setIsLoading(true)
  const start = minYear.toString().padStart(4, '0')
  const end = maxYear.toString().padStart(4, '0')
  if (start > end) {
    api.messages.info('Please select a start year before the end year')
    return
  }
  const qs = {
    start: start,
    end: end,
    timeResolution: 'year',
    timeZero: zeroYearOffset,
  }
  const body = {
    boundaryGeometry: geometry,
  }
  const url = `${TIMESERIES_ENDPOINT}${datasetUri}?${queryString.stringify(qs)}`
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
  isLoadingData = false
  hasData = false

  @Mutation
  setIsLoading(value) {
    this.isLoadingData = value
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
    datasetUri,
    geometry,
    minYear,
    maxYear,
    zeroYearOffset,
  }) {
    updateDataset(this, datasetUri, geometry, minYear, maxYear, zeroYearOffset)
  }
}

export { DataSet }
