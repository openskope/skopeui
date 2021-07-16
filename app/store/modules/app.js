import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";

@Module({ stateFactory: true, namespaced: true, name: "app" })
class App extends VuexModule {
  isVisible = false;

  steps = [
    {
      id: 1,
      name: "index",
      label: "Select Dataset",
      icon: "fas fa-database",
    },
    {
      id: 2,
      name: "dataset-id-studyarea",
      label: "Select Area",
      icon: "fas fa-map",
    },
    {
      id: 3,
      name: "dataset-id-visualize-variable",
      label: "Visualize Data",
      icon: "fas fa-chart-bar",
    },
    {
      id: 4,
      name: "dataset-id-analyze-variable",
      label: "Analyze Data",
      icon: "fas fa-chart-line",
    },
  ];

  stepNames = [
    "index",
    "dataset-id",
    "dataset-id-visualize-variable",
    "dataset-id-analyze-variable",
  ];

  /**
   * Toggle drawer with options click filter datasets.
   * @param {*} isVisible
   */
  @Mutation
  setDrawer(isVisible) {
    this.isVisible = isVisible;
  }

  /**
   * Pass value to toggle drawer.
   * @param {*} isVisible Value that determines show/hide (1/0)drawer
   */
  @Action({ commit: "setDrawer" })
  toggleDrawer(isVisible) {
    this.context.commit("setDrawer", isVisible);
    return isVisible;
  }
}

export { App };
