// Would need to make a custom debounce decorator so
// that debounced methods can exist in a vue-class-component
//
// Could use or take from https://github.com/bvaughn/debounce-decorator
import _ from 'lodash'
import { API } from '@/plugins/store'
import { TIMESERIES_ENDPOINT } from '@/store/modules/constants'

async function updateTimeSeries(
  api,
  { datasetId, variableId, geometry, minYear, maxYear, zeroYearOffset }
) {
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
    boundaryGeometry: geometry,
    start: start,
    end: end,
  }
  const url = TIMESERIES_ENDPOINT
  try {
    const response = await api.store.$axios.$post(url, body)
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
}

export const retrieveTimeSeries = _.debounce(updateTimeSeries, 300)

export const loadTimeSeries = _.debounce(async function (api) {
  const dataset = api.dataset
  console.log('loading time series...', dataset.canHandleTimeSeriesRequest)
  if (dataset.canHandleTimeSeriesRequest) {
    const timeseriesReqData = {
      datasetId: dataset.metadata.id,
      variableId: dataset.variable.id,
      geometry: dataset.geometry,
      minYear: dataset.timespan[0],
      maxYear: dataset.timespan[1],
      zeroYearOffset: dataset.metadata.timespan.period.timeZero,
    }
    updateTimeSeries(api, timeseriesReqData)
  }
}, 300)
