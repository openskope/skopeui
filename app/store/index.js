export const state = () => ({
  messages: []
})

export const getters = {
  messages(state) {
    return state.messages
  }
}

export const actions = {
  info({ state, commit }, message) {
    commit('addMessage', { type: 'info', message })
  },
  error({ state, commit }, message) {
    commit('addMessage', { type: 'error', message })
  },
  dismiss({ state, commit }, index) {
    commit('removeMessage', index)
  },
  clearMessages({ state, commit }) {
    commit('clearMessages')
  }
}

export const mutations = {
  clearMessages(state) {
    state.messages = []
  },
  addMessage(state, alert) {
    state.messages.push(alert)
  },
  removeMessage(state, index) {
    state.messages.splice(index, 1)
  }
}
