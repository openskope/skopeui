import _ from "lodash";
import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { API } from "@/plugins/store";

const updateAnalysis = _.debounce(async function (vuex, data) {
  const api = new API(vuex.store);
  api.analyze.setResponse(
    await vuex.store.$axios.$post(
      // 'http://localhost:8001/timeseries-service/api/v2/datasets/yearly',
      "https://api.openskope.org/timeseries-service/api/v2/datasets/yearly",
      data
    )
  );
}, 300);

@Module({ stateFactory: true, namespaced: true, name: "analyze" })
class Analyze extends VuexModule {
  request = {};
  waitingForResponse = false;
  response = {
    time_range: { gte: 0, lte: 0 },
    values: [],
    n_cells: 1,
    area: 0,
  };
  responseError = {};

  @Mutation
  setWaitingForResponse(value) {
    this.waitingForResponse = value;
  }

  @Mutation
  setResponse(response) {
    console.log({ response });
    this.response = response;
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

export { Analyze };
