/**
 * Actions used by the visualize page only
 */

// Would need to make a custom debounce decorator so
// that debounced methods can exist in a vue-class-component
//
// Could use or take from https://github.com/bvaughn/debounce-decorator
import _ from "lodash";
import { TIMESERIES_V2_ENDPOINT } from "@/store/modules/constants";

function convertV1ShapeToV2(data) {
  return {
    dataset_id: data.datasetId,
    variable_id: data.variableId,
    selected_area: data.geometry,
    zonal_statistic: "mean",
    time_range: {
      gte: data.minYear,
      lte: data.maxYear,
    },
    transforms: [],
  };
}

async function updateTimeSeries(api, data) {
  const dataset = api.dataset;
  console.log({ timeseriesRequestData: data });
  const { time_range } = data;
  console.log({
    metadata: dataset.metadata,
    geoJson: dataset.geoJson,
    variable: dataset.variable,
  });
  if (!dataset.canHandleTimeSeriesRequest) {
    console.log("Cannot handle timeseries request. Aborting.");
    dataset.setTimeSeriesNoArea();
    return;
  }
  dataset.setTimeSeriesLoading();
  const start = time_range.gte;
  const end = time_range.lte;
  if (start > end) {
    api.messages.info("Please select a start year before the end year");
    return;
  }
  try {
    const response = await api.store.$axios.$post(TIMESERIES_V2_ENDPOINT, data);
    const timeZeroOffset = dataset.metadata.timespan.period.timeZero;
    const timeseries = {
      x: _.range(
        parseInt(response.time_range.gte) + timeZeroOffset,
        parseInt(response.time_range.lte) + timeZeroOffset + 1
      ),
      y: response.values,
    };
    console.log({ timeseries });
    dataset.setTimeSeries(timeseries);
    dataset.setTimeSeriesLoaded();
  } catch (e) {
    dataset.clearTimeSeries();
    if (e.response) {
      // https://github.com/axios/axios#handling-errors
      const statusCode = e.response.status;
      const responseData = e.response.data;
      console.error("failed timeseries request: ", {
        statusCode,
        responseData,
      });
      if (statusCode === 504) {
        dataset.setTimeSeriesTimeout();
      } else if (statusCode >= 500) {
        console.error("server error: ", e);
        dataset.setTimeSeriesServerError(responseData.detail);
      } else if (statusCode >= 400) {
        // 422 = validation error
        dataset.setTimeSeriesBadRequest(responseData.detail);
      } else if (statusCode === 200) {
        dataset.setTimeSeriesSuccess();
      } else {
        console.error("Unhandled status code: ", statusCode);
      }
    } else if (e.request) {
      // browser made a request but didn't see a response, likely a timeout / client network error
      // FIXME: distinguish between this and a server side timeout eventually
      dataset.setTimeSeriesTimeout();
    }
  }
}

export const retrieveTimeSeries = _.debounce(updateTimeSeries, 300);

export const loadTimeSeries = _.debounce(async function (api) {
  const dataset = api.dataset;
  console.log("loading time series...", dataset.canHandleTimeSeriesRequest);
  if (dataset.canHandleTimeSeriesRequest) {
    updateTimeSeries(api, dataset.timeseriesRequestData);
  }
}, 300);

export function saveGeoJson(warehouse, api, geoJson) {
  warehouse.set(api.dataset.geoJsonKey, geoJson);
  api.dataset.setGeoJson(geoJson);
}

export function initializeDataset(warehouse, api, metadataId, variableId) {
  api.dataset.loadMetadata(metadataId);
  api.dataset.loadVariable({ metadataId, variableId });
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
