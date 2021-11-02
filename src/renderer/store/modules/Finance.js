const state = {
  data: {}
}

const actions = {
  async setFinanceData ({ commit }, data) {
    commit('SET_DATA', data)
  }
}

const mutations = {
  SET_DATA (state, data) {
    state.data = data
  }
}

const getters = {
  getFinanceData: (state) => state.data
}

export default {
  state,
  mutations,
  actions,
  getters
}
