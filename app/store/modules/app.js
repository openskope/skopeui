import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

// drawer visibility and v-stepper state
export const STEPS = Object.freeze({
  SELECT_DATASET: 1,
  DEFINE_STUDY_AREA: 2,
  ANIMATE_MAP: 3,
  VISUALIZE_DATA: 4,
  VIEW_METADATA: 5,
})

@Module({ stateFactory: true, namespaced: true, name: 'app' })
class App extends VuexModule {
  isDisabled = 0
  currentStep = STEPS.SELECT_DATASET
  isVisible = 0

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
    console.log('isVisible: %i', isVisible)
    this.isVisible = isVisible
  }

  /**
   * Set step from stepper navigation.
   * @param {*} step
   */
  @Mutation
  setStep(step) {
    this.currentStep = step
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
    return isVisible
  }

  /**
   * Change current step in app via click.
   * @param {*} step The step the user clicked on
   */
  @Action({ commit: 'setStep' })
  selectStep(step) {
    this.context.commit('setStep', step)
    return step
  }
}

export { App }
