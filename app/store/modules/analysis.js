import _ from "lodash";
import { Module, VuexModule, Mutation } from "vuex-module-decorators";
import { filterTimeSeries, summarize, extractYear } from "@/store/stats";

// expected response structure from the time series endpoint
const EMPTY_RESPONSE = {
  area: 0,
  n_cells: 1,
  series: [],
  zonal_statistic: "mean",
  dataset_id: "",
  variable_id: "",
};

@Module({ stateFactory: true, name: "analysis", namespaced: true })
class Analysis extends VuexModule {
  request = {};
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

  get timeseries() {
    return this.response.series.map((s) => ({
      x: _.range(
        extractYear(s.time_range.gte),
        extractYear(s.time_range.lte) + 1
      ),
      y: s.values,
      options: s.options,
    }));
  }

  get summaryStatistics() {
    // returns an array of summary statistics over all the filtered time series
    return this.filteredTimeSeries.map((timeseries) => ({
      ...summarize(timeseries),
      series: timeseries.name,
    }));
  }

  get filteredTimeSeries() {
    return this.timeseries.map((ts) =>
      filterTimeSeries({
        timeseries: ts,
        // NOTE: accessing the dataset store's temporalRange
        // property uses dot syntax instead of "dataset/temporalRange"
        temporalRange: this.context.rootState.dataset.temporalRange,
        // getters must be accessed by string key to avoid
        // eager evaluation errors "Cannot read property 'minYear' of undefined"
        minYear: this.context.rootGetters["dataset/minYear"],
      })
    );
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
  clearResponse() {
    this.response = EMPTY_RESPONSE;
  }

  @Mutation
  setResponseError(e) {
    console.log({ e });
    this.responseError = e;
  }
}

export { Analysis };
