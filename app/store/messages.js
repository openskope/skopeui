import {
  Module,
  VuexModule,
  Action,
  Mutation,
  MutationAction,
} from 'vuex-module-decorators'

@Module({ stateFactory: true, name: 'messages' })
class Messages extends VuexModule {
  messages = []

  @Action
  info(message) {
    this.context.commit('addMessage', { type: 'info', message })
  }

  @Action
  error(message) {
    this.context.commit('addMessage', { type: 'error', message })
  }

  @Action
  dismiss(index) {
    this.context.commit('removeMessage', index)
  }

  @MutationAction({ mutate: ['messages'] })
  clearMessages() {
    return []
  }

  @Mutation
  addMessage(alert) {
    this.messages.push(alert)
  }

  @Mutation
  removeMessage(index) {
    this.messages.splice(index, 1)
  }
}

export { Messages }
