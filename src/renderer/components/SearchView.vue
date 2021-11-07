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
          <a @click="clickItem(item[0][0], item[1][0])">{{item[0][0]}}({{item[2][0]}}) > {{item[1][0]}}</a>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ipcRenderer } from 'electron'
import $ from 'jquery'
import util from '../common/util'
// import NaverKorea from '../services/naver_korea'

export default {
  name: 'search-view',
  data: () => ({
    itemName: '',
    searchItemList: [],
    jsCodes: {
      btnYearFinance: 'document.querySelector("#coinfo_cp").contentDocument.querySelector("#cns_Tab21").click()',
      yearFinanceTable: 'document.querySelector("#coinfo_cp").contentDocument.querySelector("#cTB00").nextElementSibling.innerHTML',
      treasuryStock: 'document.querySelector("#coinfo_cp").contentDocument.querySelector("#cTB13").innerHTML',
      btnFinanceStatusTable: 'document.querySelector("#rpt_tab2").click()',
      financeStatusTable: 'document.querySelector("#c1030001_p1").nextElementSibling.innerHTML',
      currentPrice: 'document.querySelector("#chart_area > .rate_info > .today").innerHTML'
    },
    financeData: {},
    $yearFinanceTable: null,
    $treasuryStock: null,
    $financeStatusTable: null,
    $currentPrice: null,
    isChildDomReady: false,
    isIpcLoading: false,
    intervalTime: 500,
    expectedIncomeRate: 7.9 // 기대수익률
  }),
  computed: {
    ...mapGetters(['getItems'])
  },
  created () {
    this.$store.dispatch('resetItemList')
  },
  mounted () {
    ipcRenderer.on('resultExecutedJs', this.resultExecutedJs)
  },
  methods: {
    resultExecutedJs (event, js) {
      console.log('resultExecutedJs given by child window', js)
      if (js) {
        switch (js.code) {
          case this.jsCodes.yearFinanceTable:
            this.$yearFinanceTable = $(js.result)
            break
          case this.jsCodes.treasuryStock:
            this.$treasuryStock = $(js.result)
            break
          case this.jsCodes.financeStatusTable:
            this.$financeStatusTable = $(js.result)
            break
          case this.jsCodes.currentPrice:
            this.$currentPrice = $(js.result)
            break
          default:
            console.log('이건머지: ', js)
        }
      }
      this.isIpcLoading = false
    },
    checkIsChildDomReady () {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          console.log('this.isChildDomReady > ', this.isChildDomReady)
          if (this.isChildDomReady) {
            clearInterval(interval)
            resolve()
          }
        }, this.intervalTime)
      })
    },
    checkIsIpcLoading () {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          console.log('this.isIpcLoading > ', this.isIpcLoading)
          if (!this.isIpcLoading) {
            clearInterval(interval)
            resolve()
          }
        }, this.intervalTime)
      })
    },
    sendExecuteJs (code) {
      console.log('sendExecuteJs!!', code)
      ipcRenderer.send('executeJs', code)
      this.isIpcLoading = true
    },
    getYearFinanceData () {
      $(this.$yearFinanceTable.get().reverse()).each((index, item) => {
        const $item = $(item)
        if ($item.is('table')) {
          $item.find('tbody > tr').each((inIdx, tr) => {
            const $tr = $(tr)
            const headerText = $tr.find('th').text()
            let key = null
            if (headerText.includes('EPS')) {
              key = 'EPS'
            } else if (headerText.includes('PER')) {
              key = 'PER'
            } else if (headerText === '영업이익') {
              key = '영업이익'
            } else if (headerText.includes('당기순이익(지배)')) {
              key = '당기순이익_지배'
            } else if (headerText === '당기순이익') {
              key = '당기순이익'
            } else if (headerText.includes('ROE')) {
              key = 'ROE'
            } else if (headerText.includes('BPS')) {
              key = 'BPS'
              // 올해것/ 내년것
            } else if (headerText.includes('자본총계(지배)')) {
              key = '자본총계_지배'
            } else if (headerText.includes('발행주식수')) {
              key = '발행주식수'
            }

            if (key) {
              this.financeData[key] = []
              $tr.find('td').each((ininIdx, td) => {
                const value = $(td).text()
                if (value) {
                  this.financeData[key].push(parseFloat(util.removeNumberComma(value)))
                }
              })
            }
          })

          return false
        }
      })
    },
    getTreasuryStock () {
      this.$treasuryStock.each((index, item) => {
        const $item = $(item)
        if ($item.is('tbody')) {
          $item.find('tr').each((inIdx, tr) => {
            const $tr = $(tr)
            if ($tr.find('td.txt').attr('title') === '자사주') {
              this.financeData['자사주'] = []
              $tr.find('td.num').each((ininIdx, num) => {
                const value = $(num).text()
                if (value) {
                  this.financeData['자사주'].push(
                    parseFloat(util.removeNumberComma($.trim($(num).text())))
                  )
                }
              })
            }
          })
        }
      })
    },
    getCurrentPrice () {
      this.$currentPrice.each((index, noToday) => {
        if ($(noToday).hasClass('no_today')) {
          let price = ''
          $(noToday).find('em > span').each((inIdx, item) => {
            price += $(item).text()
            console.log(price)
          })
          console.log(price)
          if (price) {
            price = parseInt(util.removeNumberComma($.trim(price)), 10)
          } else {
            price = 0
          }
          console.log(price)
          this.financeData['현재가'] = [price]
          return false
        }
      })
    },
    async getData () {
      this.sendExecuteJs(this.jsCodes.currentPrice)
      await this.checkIsIpcLoading()
      if (this.$currentPrice && this.$currentPrice.length > 1) {
        this.getCurrentPrice()
      }
      this.sendExecuteJs(this.jsCodes.btnYearFinance)
      await this.checkIsIpcLoading()
      this.sendExecuteJs(this.jsCodes.yearFinanceTable)
      await this.checkIsIpcLoading()
      if (this.$yearFinanceTable && this.$yearFinanceTable.length > 1) {
        this.getYearFinanceData()
      } else {
        alert('데이터 조회 실패함!!!')
      }
      this.sendExecuteJs(this.jsCodes.treasuryStock)
      await this.checkIsIpcLoading()
      if (this.$treasuryStock) {
        this.getTreasuryStock()
      }

      // TODO 정보 가져오기... 그후 값 셋팅 하기
      // loading > https://github.com/ankurk91/vue-loading-overlay
      // 셋팅 후 결과 페이지로....

      // ipcRenderer.send('executeJs', 'document.documentElement.innerHTML')
      // document.querySelector("#coinfo_cp").contentDocument
    },
    setTrueIsChildDomReady () {
      this.isChildDomReady = true
    },
    async getFinanceStatusData () {
      this.sendExecuteJs(this.jsCodes.btnFinanceStatusTable)
      await this.checkIsIpcLoading()
      this.sendExecuteJs(this.jsCodes.financeStatusTable)
      await this.checkIsIpcLoading()

      if (this.$financeStatusTable && this.$financeStatusTable.length > 0) {
        $(this.$financeStatusTable.get().reverse()).each((index, item) => {
          const $item = $(item)
          if ($item.is('table')) {
            $item.find('tbody > tr').each((inIdx, tr) => {
              const $tr = $(tr)
              const headerText = $tr.find('td.txt').attr('title')
              let key = null
              if (headerText === '유동자산') {
                key = '유동자산'
              } else if (headerText === '유동부채') {
                key = '유동부채'
              } else if (headerText === '투자자산') {
                key = '투자자산'
              } else if (headerText === '부채총계') {
                key = '부채총계'
              }

              if (key) {
                if (this.financeData[key] && this.financeData[key].length > 0) {
                  return true
                }
                this.financeData[key] = []
                $tr.find('td').each((ininIdx, td) => {
                  const $td = $(td)
                  if ($td.hasClass('num')) {
                    const value = $.trim($td.text())
                    // console.log(value)
                    if (value) {
                      this.financeData[key].push(
                        parseFloat(util.removeNumberComma(value)))
                    }
                  }
                })
              }
            })

            return false
          }
        })

        // 고정부채 = 부채총계 - 유동부채
        this.financeData['고정부채'] = []
        if (this.financeData['부채총계'] && this.financeData['유동부채']) {
          let length = this.financeData['부채총계'].length
          if (this.financeData['유동부채'] < length) {
            length = this.financeData['유동부채']
          }
          for (let i = 0; i < length; i++) {
            this.financeData['고정부채'].push(util.subtraction(this.financeData['부채총계'][i], this.financeData['유동부채'][i]))
          }
        }
      }
    },
    // 재무재표 연간 버튼 클릭
    async clickItem (itemCode, itemName) {
      const loader = this.$loading.show({
        loader: 'spinner'
      })
      this.isChildDomReady = false
      this.isIpcLoading = false
      ipcRenderer.removeListener('childDomReady', this.setTrueIsChildDomReady)
      let url = `https://finance.naver.com/item/coinfo.naver?code=${itemCode}&target=finsum_more`
      ipcRenderer.send('loadurl', url)
      ipcRenderer.on('childDomReady', this.setTrueIsChildDomReady)
      await this.checkIsChildDomReady()

      // data 가져오기
      await this.getData()

      ipcRenderer.removeListener('childDomReady', this.setTrueIsChildDomReady)
      url = `https://navercomp.wisereport.co.kr/v2/company/c1030001.aspx?cmp_cd=${itemCode}&cn=`
      ipcRenderer.send('loadurl', url)
      ipcRenderer.on('childDomReady', this.setTrueIsChildDomReady)
      await this.checkIsChildDomReady()

      // 재무상태표 가져오기
      await this.getFinanceStatusData()
      await this.$store.dispatch('setFinanceData', this.financeData)
      loader.hide()
      this.$router.push({path: '/result', query: { itemCode, itemName }})
    },
    async findItemName () {
      if (this.itemName) {
        await this.$store.dispatch('fetchItemList', this.itemName)
      }
    }
  }
}
</script>
