/**
 * Actions used by the visualize and analysis vue components
 */

// Would need to make a custom debounce decorator so
// that debounced methods can exist in a vue-class-component
//
// Could use or take from https://github.com/bvaughn/debounce-decorator
import _ from "lodash";
import {
  TIMESERIES_ENDPOINT,
  METADATA_ENDPOINT,
} from "@/store/modules/constants";
import { extractYear } from "@/store/stats";

async function updateTimeSeries(api, data) {
  const dataset = api.dataset;
  if (!dataset.canHandleTimeSeriesRequest) {
    console.log("Cannot handle timeseries request. Aborting.");
    dataset.setTimeSeriesNoArea();
    return;
  }
  dataset.setTimeSeriesLoading();
  try {
    const response = await api.store.$axios.$post(TIMESERIES_ENDPOINT, data);
    const originalSeries = response.series[0];
    const timeSeries = {
      x: _.range(
        extractYear(originalSeries.time_range.gte),
        extractYear(originalSeries.time_range.lte) + 1
      ),
      y: originalSeries.values,
      options: originalSeries.options,
    };
    const numberOfCells = response.n_cells;
    const totalCellArea = response.area;
    dataset.setTimeSeries({ timeSeries, numberOfCells, totalCellArea });
    dataset.setTimeSeriesLoaded();
  } catch (e) {
    dataset.clearTimeSeries();
    if (e.response) {
      // https://github.com/axios/axios#handling-errors
      const statusCode = e.response.status;
      const responseData = e.response.data;
      console.error("failed timeSeries request: ", {
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
  if (dataset.canHandleTimeSeriesRequest) {
    console.log("loading time series with ", dataset.timeSeriesRequestData);
    updateTimeSeries(api, dataset.timeSeriesRequestData);
  } else {
    console.log("cannot handle time series request: ");
  }
}, 300);

const updateAnalysis = _.debounce(async function (api, data) {
  try {
    api.analysis.setResponse(
      await api.store.$axios.$post(TIMESERIES_ENDPOINT, data)
    );
  } catch (e) {
    api.analysis.setResponseError(e);
  }
}, 300);

export async function retrieveAnalysis(api, data) {
  console.log("RETRIEVING ANALYSIS");
  if (!isValidRequestData(data)) {
    console.log(
      "Unable to retrieve analysis with invalid request data: ",
      data
    );
    return;
  }
  // reload skope geometry + temporal range
  api.dataset.setGeoJson(data.selected_area);
  api.dataset.setTemporalRange([
    extractYear(data.time_range.gte),
    extractYear(data.time_range.lte),
  ]);
  api.analysis.setWaitingForResponse(true);
  try {
    await updateAnalysis(api, data);
  } finally {
    api.analysis.setWaitingForResponse(false);
  }
}

export function isValidRequestData(data) {
  return !Object.values(data).some((attribute) => attribute == undefined);
}

export async function loadAllDatasetMetadata(api) {
  if (api.metadata.shouldRefresh) {
    console.log("refreshing dataset metadata");
    try {
      const allDatasetMetadata = await api.store.$axios.$get(METADATA_ENDPOINT);
      api.metadata.setAllDatasetMetadata(allDatasetMetadata);
      api.metadata.setLastRefreshed();
    } catch (e) {
      console.error(e);
      // should start to use the messages component to display user messages
      if (process.client) {
        alert("Unable to access skope api metadata at: " + METADATA_ENDPOINT);
      }
    }
  } else {
    console.log(
      "Not loading all metadata, already queried at ",
      api.metadata.lastRefreshed
    );
  }
}

export async function loadMetadata(api, id) {
  const datasetMetadata = api.metadata.find(id);
  api.dataset.setMetadata(datasetMetadata);
}

export function saveGeoJson(warehouse, api, geoJson) {
  const geoJsonKey = api.dataset.geoJsonKey;
  warehouse.set(geoJsonKey, geoJson);
  api.dataset.setGeoJson(geoJson);
  if (!_.isEmpty(api.analysis.requestData)) {
    // FIXME: needed to prevent cached geojson from lingering in the analysis store
    // should see if we can unify the dataset + analysis store apis
    // and make them more coherent to reduce the need for this kind of manual updating
    api.analysis.setGeoJson(geoJson);
  }
}

export function filterDatasetMetadata(api, filterCriteria) {
  api.metadata.setFilterCriteria(filterCriteria);
}

export async function initializeDataset(
  warehouse,
  api,
  metadataId,
  variableId
) {
  console.log("initializeDataset ", { metadataId, variableId });
  await loadAllDatasetMetadata(api);
  if (metadataId === api.dataset.metadata?.id) {
    console.log(
      "Already initialized dataset metadata, ignoring request: ",
      metadataId,
      " existing: ",
      api.dataset.metadata.id
    );
    return;
  }
  const datasetMetadata = await api.metadata.find(metadataId);
  if (datasetMetadata === null) {
    if (process.client) {
      alert(
        "Please try again later, we were unable to locate dataset metadata for " +
          metadataId
      );
    }
    return;
  }
  api.dataset.setMetadata(datasetMetadata);
  if (variableId == null) {
    // set a default variable if no variable id was passed in
    variableId = datasetMetadata.variables[0].id;
    console.log("set default variable on dataset: ", variableId);
  }
  api.dataset.setVariable(variableId);
  if (process.client) {
    initializeDatasetGeoJson(warehouse, api);
  }
}

export function initializeDatasetGeoJson(warehouse, api) {
  if (api.dataset.hasGeoJson) {
    console.log(
      "dataset store already has geojson, no need to restore from warehouse"
    );
    return;
  }
  const geoJson = warehouse.get(api.dataset.geoJsonKey) || null;
  api.dataset.setGeoJson(geoJson);
}

export function clearGeoJson(warehouse, api) {
  warehouse.remove(api.dataset.geoJsonKey);
  api.dataset.clearGeoJson();
}

/**
 * Loads data from api.analysis.request if it exists. Assumes that
 * it would be cleared by any actions that invalidate the request data
 * (change in dataset, study area, or variable)
 *
 * @param {*} api
 */
export async function initializeRequestData(api) {
  // merge dataset default api request data with existing api request data
  const analysisRequestData = api.analysis.requestData;
  const incomingRequestData = api.dataset.defaultApiRequestData;
  console.log(
    "Setting transform, zonal_statistic and requested_series_options for request data to ",
    { analysisRequestData }
  );
  if (analysisRequestData?.transform) {
    incomingRequestData.transform = analysisRequestData.transform;
  }
  if (analysisRequestData?.zonal_statistic) {
    incomingRequestData.zonal_statistic = analysisRequestData.zonal_statistic;
  }
  if (analysisRequestData?.requested_series_options) {
    incomingRequestData.requested_series_options =
      analysisRequestData.requested_series_options;
  }
  console.log("incoming request data: ", { incomingRequestData });
  api.analysis.setDefaultRequestData(incomingRequestData);
  return incomingRequestData;
}

export async function loadRequestData(api, requestData) {
  // FIXME: need to be the source of truth for all things dataset + analysis store related
  // should be able to initialize the dataset + analysis stores from this single call
  api.dataset.setTemporalRange([
    extractYear(requestData.time_range.gte),
    extractYear(requestData.time_range.lte),
  ]);
  api.dataset.setGeoJson(requestData.selected_area);
  api.analysis.setRequestData(requestData);
}
