import Vue from 'vue'

const state = {
  items: []
}

const actions = {
  async fetchItemList ({ commit }, itemName) {
    const result = await Vue.http.get(`https://ac.finance.naver.com/ac?q=${encodeURI(itemName)}&q_enc=euc-kr&st=111&frm=stock&r_format=json&r_enc=euc-kr&r_unicode=0&t_koreng=1&r_lt=111`)
    const items = result.data.items[0]
    commit('SET_ITEM_LIST', items)
    return items
  }
}

const mutations = {
  SET_ITEM_LIST (state, data) {
    state.items = data
  }
}

const getters = {
  getItems: (state) => state.items
}

export default {
  state,
  mutations,
  actions,
  getters
}
