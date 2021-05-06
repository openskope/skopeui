import _ from "lodash";
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { filterTimeSeries, summarize } from "@/store/stats";

// expected response structure from the time series endpoint
const EMPTY_RESPONSE = {
  area: 0,
  n_cells: 1,
  series: [],
  zonal_statistic: "mean",
  values: [],
};

@Module({ stateFactory: true, name: "analysis", namespaced: true })
class Analysis extends VuexModule {
  request = {};
  waitingForResponse = false;
  response = EMPTY_RESPONSE;
  responseError = {};

  get timeseries() {
    this.response.series.map((s) => {
      return {
        x: _.range(s.time_range.gte, s.time_range.lte),
        y: s.values,
      };
    });
  }

  get summaryStatistics() {
    return { ...summarize(this.filteredTimeSeries), series: "Transformed" };
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
    console.log({ response });
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
