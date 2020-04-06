const state = {
  newValue: ''
}

const mutations = {
  SET_NEWVALUE: (state, newValue) => {
    state.newValue = newValue
  }
}

const actions = {
  watchValue({ commit }, newValue) {
    commit('SET_NEWVALUE', newValue)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
