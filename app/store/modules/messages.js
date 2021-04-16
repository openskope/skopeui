import { Module, VuexModule, Mutation } from "vuex-module-decorators";

@Module({ stateFactory: true, namespaced: true, name: "messages" })
class Messages extends VuexModule {
  messages = [];

  @Mutation
  info(message) {
    this.messages.push({ type: "info", message });
  }

  @Mutation
  error(message) {
    this.messages.push({ type: "error", message });
  }

  @Mutation
  dismiss(index) {
    this.messages.splice(index, 1);
  }

  @Mutation
  clearMessages() {
    this.messages.splice(0, this.messages.length);
  }

  @Mutation
  addMessage(alert) {
    this.messages.push(alert);
  }

  @Mutation
  removeMessage(index) {
    this.messages.splice(index, 1);
  }
}

export { Messages };
