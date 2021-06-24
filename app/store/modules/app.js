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
      instructions:
        "Welcome to the Synthesizing Knowledge of Past Environments (SKOPE) application! To examine data, click on a dataset name, pan & zoom the map, define your area of interest, then select a variable layer. ",
    },
    {
      id: 2,
      name: "dataset-id-studyarea",
      label: "Select Area",
      icon: "fas fa-map",
      instructions:
        "To define a selected area, use the map tools pan and zoom into the map and draw a polygon to select an area of study. When you are satisified with your selection, click next.",
    },
    {
      id: 3,
      name: "dataset-id-visualize-variable",
      label: "Visualize Data",
      icon: "fas fa-chart-bar",
      instructions: "Instructions here",
    },
    {
      id: 4,
      name: "dataset-id-analyze-variable",
      label: "Analyze Data",
      icon: "fas fa-chart-line",
      instructions: "Instructions here",
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
