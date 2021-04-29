import _ from "lodash";
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { API } from "@/plugins/store";
import { TIMESERIES_V2_ENDPOINT } from "@/store/modules/constants";

const updateAnalysis = _.debounce(async function (vuex, data) {
  const api = new API(vuex.store);
  try {
    api.analysis.setResponse(
      await vuex.store.$axios.$post(TIMESERIES_V2_ENDPOINT, data)
    );
  } catch (e) {
    api.analysis.setResponseError(e);
  }
}, 300);

@Module({ stateFactory: true, namespaced: true, name: "analysis" })
class Analysis extends VuexModule {
  request = {};
  waitingForResponse = false;
  response = {
    time_range: { gte: 0, lte: 0 },
    values: [],
    n_cells: 1,
    area: 0,
  };
  responseError = {};

  get timeseries() {
    return {
      x: _.range(this.response.time_range.gte, this.response.time_range.lte),
      y: this.response.values,
    };
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
  setResponseError(e) {
    console.log({ e });
    this.responseError = e;
  }

  @Action
  async retrieveAnalysis(data) {
    this.setWaitingForResponse(true);
    try {
      await updateAnalysis(this, data);
    } finally {
      this.setWaitingForResponse(false);
    }
  }
}

export { Analysis };
