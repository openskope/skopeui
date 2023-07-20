import _ from "lodash";
import { Module, VuexModule, Mutation } from "vuex-module-decorators";
import { formatStats, extractYear } from "@/store/stats";

// expected response structure from the time series endpoint
const EMPTY_RESPONSE = {
  area: 0,
  n_cells: 1,
  series: [],
  zonal_statistic: "mean",
  dataset_id: "",
  variable_id: "",
  summary_stats: [], // array of { name, mean, stdev, median }
};

@Module({ stateFactory: true, name: "analysis", namespaced: true })
class Analysis extends VuexModule {
  // requestData: see
  // https://api.openskope.org/redoc#operation/retrieve_timeseries_timeseries_post
  // for parameters + descriptions
  // FIXME: requestData.selected_area should be synced with the dataset store's geoJson
  requestData = {};
  waitingForResponse = false;
  response = EMPTY_RESPONSE;
  responseError = {};

  get cachedAnalysisId() {
    if (this.response.dataset_id && this.response.variable_id) {
      return {
        datasetId: this.response.dataset_id,
        variableId: this.response.variable_id,
      };
    } else {
      return null;
    }
  }

  @Mutation
  setVariableId(variableId) {
    this.requestData.variable_id = variableId;
  }

  /**
   * Returns the time series that the skope api generated in a form
   * that can be sent to plotly.
   * This will include up to 2 time series: an original time series and an
   * optional transformed time series if smoothing and/or z-score transformations
   * were applied
   */
  get timeseries() {
    return this.response.series.map((s) => ({
      x: _.range(
        extractYear(s.time_range.gte),
        extractYear(s.time_range.lte) + 1
      ),
      y: s.values,
      name: s.options.name,
    }));
  }

  get summaryStatistics() {
    return formatStats(this.response.summary_stats);
  }

  @Mutation
  setWaitingForResponse(value) {
    this.waitingForResponse = value;
  }

  @Mutation
  setResponse(response) {
    this.response = response;
  }

  @Mutation
  setRequestData(requestData) {
    console.log("Setting analysis request data: ", { requestData });
    this.requestData = requestData;
  }

  @Mutation
  setGeoJson(geoJson) {
    console.log("Setting analysis selected_area");
    this.requestData.selected_area = geoJson;
  }

  /**
   * set request data and clear the response
   * @param {} defaultRequestData
   */
  @Mutation
  setDefaultRequestData(defaultRequestData) {
    // clears the response as well
    console.log("setting analysis request data to default: ", {
      defaultRequestData,
    });
    this.requestData = defaultRequestData;
    this.response = EMPTY_RESPONSE;
  }

  @Mutation
  setResponseError(e) {
    console.error("analysis store response error: ", { e });
    this.responseError = e;
  }
}

export { Analysis };
