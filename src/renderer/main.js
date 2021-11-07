import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.filter('makeComma', val => String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ','))
Vue.filter('makeInt', val => {
  if (val > 0) {
    return parseInt(val, 10)
  }
  return 0
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
