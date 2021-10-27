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
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NaverKorea from '../services/naver_korea'

export default {
  name: 'search-view',
  data: () => ({
    itemName: '',
    searchItemList: []
  }),
  computed: {
    ...mapGetters(['getItems'])
  },
  methods: {
    async clickItem (itemCode) {
      const nk = new NaverKorea(itemCode)
      await nk.scrap()
    },
    async findItemName () {
      if (this.itemName) {
        await this.$store.dispatch('fetchItemList', this.itemName)
      }
    }
  }
  // https://navercomp.wisereport.co.kr/v2/company/ajax/cF1001.aspx?cmp_cd=005930&fin_typ=0&freq_typ=A&encparam=WHYrSUF0Z0FSak1vQWVmUVcxUGdCQT09&id=VGVTbkwxZ2
  // https://navercomp.wisereport.co.kr/v2/company/ajax/cF1001.aspx?cmp_cd=028260&fin_typ=0&freq_typ=Y&encparam=eHo0SmV6OVE0MnZlak12eFcvM1NiUT09&id=ZTRzQlVCd0
}
</script>
