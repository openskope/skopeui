import _ from "lodash";
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { filterTimeSeries, summarize } from "@/store/stats";

// expected response structure from the time series endpoint
const EMPTY_RESPONSE = {
  time_range: { gte: 0, lte: 0 },
  values: [],
  n_cells: 1,
  area: 0,
};

@Module({ stateFactory: true, name: "analysis", namespaced: true })
class Analysis extends VuexModule {
  request = {};
  waitingForResponse = false;
  response = EMPTY_RESPONSE;
  responseError = {};

  get timeseries() {
    return {
      x: _.range(this.response.time_range.gte, this.response.time_range.lte),
      y: this.response.values,
    };
  }

  get summaryStatistics() {
    return { ...summarize(this.filteredTimeSeries), series: "Transformed" };
  }

  get filteredTimeSeries() {
    return filterTimeSeries({
      timeseries: this.timeseries,
      // NOTE: accessing the dataset store's temporalRange
      // property uses dot syntax instead of "dataset/temporalRange"
      temporalRange: this.context.rootState.dataset.temporalRange,
      // getters must be accessed by string key to avoid
      // eager evaluation errors "Cannot read property 'minYear' of undefined"
      minYear: this.context.rootGetters["dataset/minYear"],
    });
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
