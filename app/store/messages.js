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
    this.addMessage({ type: 'info', message })
  }

  @Action
  error(message) {
    this.addMessage({ type: 'error', message })
  }

  @Action
  dismiss(index) {
    this.removeMessage(index)
  }

  @Mutation
  clearMessages() {
    this.messages.splice(0, this.messages.length)
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
