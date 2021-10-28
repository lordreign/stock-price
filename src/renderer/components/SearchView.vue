<template>
  <div class="container is-fluid">
    <h3 class="title is-3">종목 적정가 분석</h3>
    <form class="box">
      <div class="field">
        <label class="label">종목 검색</label>
        <div class="control">
          <input class="input" type="text" placeholder="종목명 입력" v-model="itemName" />
        </div>
      </div>
      <div class="buttons is-centered">
        <button class="button is-primary" @click="findItemName()">검색</button>
      </div>
    </form>
    <section v-if="getItems">
      <ul>
        <li v-for="item in getItems">
          <a @click="clickItem(item[0][0])">{{item[0][0]}}({{item[2][0]}}) > {{item[1][0]}}</a>
        </li>
      </ul>
      <router-link to="/webview" class="nav-link">webview</router-link>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ipcRenderer } from 'electron'
import util from '../common/util'
// import NaverKorea from '../services/naver_korea'

export default {
  name: 'search-view',
  data: () => ({
    itemName: '',
    searchItemList: [],
    jsCodes: {
      year: 'document.querySelector("#coinfo_cp").contentDocument.querySelector("#cns_Tab21").click()'
    }
  }),
  computed: {
    ...mapGetters(['getItems'])
  },
  mounted () {
    ipcRenderer.on('resultExecutedJs', (event, html) => {
      console.log('resultExecutedJs given by child window')
      console.log(html)
    })
  },
  methods: {
    async clickItem (itemCode) {
      // this.$router.push({path: '/naver-webview', query: { itemCode }})
      const url = `https://finance.naver.com/item/coinfo.naver?code=${itemCode}&target=finsum_more`
      ipcRenderer.send('loadurl', url)
      ipcRenderer.on('childDomReady', () => {
        util.sleep(2000)
        // 재무재표 연간 버튼 클릭
        ipcRenderer.send(
          'executeJs',
          this.jsCodes.year
        )
        // TODO 정보 가져오기... 그후 값 셋팅 하기
        // loading > https://github.com/ankurk91/vue-loading-overlay
        // 셋팅 후 결과 페이지로....

        // ipcRenderer.send('executeJs', 'document.documentElement.innerHTML')
        // document.querySelector("#coinfo_cp").contentDocument
      })
    },
    async findItemName () {
      if (this.itemName) {
        await this.$store.dispatch('fetchItemList', this.itemName)
      }
    }
  }
}
</script>
