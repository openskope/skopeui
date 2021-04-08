// Would need to make a custom debounce decorator so
// that debounced methods can exist in a vue-class-component
//
// Could use or take from https://github.com/bvaughn/debounce-decorator
import _ from "lodash";
import { TIMESERIES_ENDPOINT } from "@/store/modules/constants";

async function updateTimeSeries(api, data) {
  const dataset = api.dataset;
  const messages = api.messages;
  console.log({ timeseriesRequestData: data });
  const { datasetId, variableId, geometry, minYear, maxYear } = data;
  console.log({
    metadata: dataset.metadata,
    geoJson: dataset.geoJson,
    variable: dataset.variable,
  });
  if (!dataset.canHandleTimeSeriesRequest) {
    console.log("Cannot handle timeseries request. Aborting.");
    return;
  }
  dataset.setIsLoading(true);
  const start = minYear.toString().padStart(4, "0");
  const end = maxYear.toString().padStart(4, "0");
  if (start > end) {
    api.messages.info("Please select a start year before the end year");
    return;
  }
  const body = {
    datasetId,
    variableName: variableId,
    boundaryGeometry: geometry,
    start: start,
    end: end,
  };
  const url = TIMESERIES_ENDPOINT;
  try {
    const response = await api.store.$axios.$post(url, body);
    const timeZeroOffset = dataset.metadata.timespan.period.timeZero;
    const timeseries = {
      x: _.range(
        parseInt(response.start) + timeZeroOffset,
        parseInt(response.end) + timeZeroOffset + 1
      ),
      y: response.values,
    };
    console.log({ timeseries });
    messages.clearMessages();
    dataset.setTimeSeries(timeseries);
  } catch (e) {
    console.error(e);
    messages.clearMessages();
    dataset.clearTimeSeries();
    let errorMessage =
      "Unable to load data from the timeseries service, please try selecting a smaller area or contact us if the error persists.";
    if (e.response) {
      console.error("received error response from server: ", e);
      const responseData = e.response.data;
      if (responseData.status === 400) {
        // bad request
        errorMessage = responseData.message;
      }
    } else if (e.request) {
      // browser made a request but didn't see a response, likely a timeout / client network error
      console.log("did not receive a server response: ", { e });
      errorMessage += ` Cause: ${e.message}`;
    }
    messages.error(errorMessage);
  }
  dataset.setIsLoading(false);
}

export const retrieveTimeSeries = _.debounce(updateTimeSeries, 300);

export const loadTimeSeries = _.debounce(async function (api) {
  const dataset = api.dataset;
  console.log("loading time series...", dataset.canHandleTimeSeriesRequest);
  if (dataset.canHandleTimeSeriesRequest) {
    const timeseriesReqData = {
      datasetId: dataset.metadata.id,
      variableId: dataset.variable.id,
      geometry: dataset.geoJson.geometry,
      minYear: dataset.timespan[0],
      maxYear: dataset.timespan[1],
      zeroYearOffset: dataset.metadata.timespan.period.timeZero,
    };
    updateTimeSeries(api, timeseriesReqData);
  }
}, 300);

export function saveGeoJson(warehouse, api, geoJson) {
  warehouse.set(api.dataset.geoJsonKey, geoJson);
  api.dataset.setGeoJson(geoJson);
}

export function initializeDataset(warehouse, api, datasetId) {
  console.log("initializing dataset ", datasetId);
  api.dataset.loadMetadata(datasetId);
  if (process.client) {
    initializeDatasetGeoJson(warehouse, api);
  }
}

export function initializeDatasetGeoJson(warehouse, api) {
  if (api.dataset.hasGeoJson) {
    console.log("dataset store already has geojson, no-op");
    return;
  }
  const geoJson = warehouse.get(api.dataset.geoJsonKey) || null;
  console.log("setting geo json: ", geoJson);
  api.dataset.setGeoJson(geoJson);
}

export function clearGeoJson(warehouse, api) {
  warehouse.remove(api.dataset.geoJsonKey);
  api.dataset.clearGeoJson();
}
