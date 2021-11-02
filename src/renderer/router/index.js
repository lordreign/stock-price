import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'search-view',
      component: () => import('../components/SearchView.vue')
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('../components/Result.vue')
    },
    {
      path: '/naver-webview',
      name: 'naver-webview',
      component: () => import('../components/NaverWebview.vue')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
