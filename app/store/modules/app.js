import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

@Module({ stateFactory: true, namespaced: true, name: 'app' })
class App extends VuexModule {
  isDisabled = 0
  isVisible = false

  steps = [
    {
      step: 1,
      name: 'index',
      label: 'Select Data Set',
      instructions:
        'Welcome to the Synthesizing Knowledge of Past Environments (SKOPE) application! To examine data, click on a dataset name, pan & zoom the map, define your area of interest, then select a variable layer. ',
    },
    {
      step: 2,
      name: 'dataset-id-studyarea',
      label: 'Define Study Area',
      instructions:
        'To define a selected area, use the map tools pan and zoom into the map and draw a polygon to select an area of study. When you are satisified with your selection, click next.',
    },
    {
      step: 3,
      name: 'dataset-id-visualize',
      label: 'Visualize Data',
      instructions: 'Instructions here',
    },
    {
      step: 4,
      name: 'dataset-id-analyze',
      label: 'Analyze Data',
      instructions: 'Instructions here',
    },
  ]

  stepNames = [
    'index',
    'dataset-id',
    'dataset-id-visualize',
    'dataset-id-analyze',
  ]

  /**
   * Determine if drawer can be toggled.
   */
  @Mutation
  disableDrawer(step) {
    if (step == 1) {
      return (this.isDisabled = 0)
    } else {
      return (this.isDisabled = 1)
    }
  }

  /**
   * Toggle drawer with options click filter datasets.
   * @param {*} openDrawer
   */
  @Mutation
  setDrawer(isVisible) {
    this.isVisible = isVisible
  }

  @Action({ commit: 'disableDrawer' })
  canShowDrawer(step) {
    this.context.commit('disableDrawer', step)
    return isDisabled
  }

  /**
   * Pass value to toggle drawer.
   * @param {*} isVisible Value that determines show/hide (1/0)drawer
   */
  @Action({ commit: 'setDrawer' })
  toggleDrawer(isVisible) {
    this.context.commit('setDrawer', isVisible)
    return isVisible
  }
}

export { App }
