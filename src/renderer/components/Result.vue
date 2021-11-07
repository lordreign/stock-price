<template>
  <div class="container is-fluid">
    <h3 class="title is-3">{{ itemName }}({{itemCode}}) 정보 수집 결과</h3>
    <table class="table">
      <tbody>
      <tr v-for="(values, key) in getFinanceData" :key="key">
        <th>{{ key }}</th>
        <td v-for="(value, i) in values" :key="`${key}_${i}`">{{value | makeComma}}</td>
        <template v-if="values.length < maxValueLength">
          <td v-for="index in (maxValueLength - values.length)"></td>
        </template>
      </tr>
      </tbody>
    </table>
    <div>--------------------------------------------------------------------</div>
    <h3 class="title is-3">적정주가 계산 결과</h3>
    <table class="table">
      <tbody>
      <tr>
        <th>적정주가 1</th>
        <td>EPS * PER</td>
        <td>{{epsPer | makeInt | makeComma}}</td>
      </tr>
      <tr>
        <th>적정주가 2</th>
        <td>현명한 투자자</td>
        <td>{{smartInvestor | makeInt | makeComma}}</td>
      </tr>
      <tr>
        <th rowspan="3">적정주가 3</th>
        <td>BPS</td>
        <td>{{ bps  | makeInt | makeComma}}</td>
      </tr>
      <tr>
        <td>EPS * 10</td>
        <td>{{ expectedEps * 10 | makeInt | makeComma}}</td>
      </tr>
      <tr>
        <td>EPS * ROE</td>
        <td>{{ epsRoe | makeInt | makeComma}}</td>
      </tr>
      <tr>
        <th rowspan="2">적정주가 4</th>
        <td>지배주주순이익 * PER</td>
        <td>{{ properNpdtPer | makeInt | makeComma}}</td>
      </tr>
      <tr>
        <td>당기순이익 * PER</td>
        <td>{{ npdtPer | makeInt | makeComma}}</td>
      </tr>
      <tr>
        <th rowspan="3">적정주가 5</th>
        <td>S-rim</td>
        <td>{{ srim | makeInt | makeComma}}</td>
      </tr>
      <tr>
        <td>매수가</td>
        <td>{{ buyPrice | makeInt | makeComma}}</td>
      </tr>
      <tr>
        <td>1차 매도가</td>
        <td>{{ firstSellPrice | makeInt | makeComma}}</td>
      </tr>
      </tbody>
    </table>

    <div class="buttons">
      <button class="button is-primary" @click="goToSearch">검색페이지 돌아가기</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

// import util from '../common/util'

export default {
  name: 'result',
  data: () => ({
    maxValueLength: 0,
    expectedIncomeRate: 7.94,
    corporateTaxRate: 25,
    itemName: null,
    itemCode: null,
    epsPer: 0,
    smartInvestor: 0,
    bps: 0,
    expectedEps: 0,
    epsRoe: 0,
    properNpdtPer: 0, // 지배주주순이익 * per
    npdtPer: 0, // 당기순이익 * per
    srim: 0,
    buyPrice: 0, //  매수가
    firstSellPrice: 0 // 1차 매도가
  }),
  computed: {
    ...mapGetters(['getFinanceData'])
  },
  created () {
    this.itemName = this.$route.query.itemName
    this.itemCode = this.$route.query.itemCode
  },
  beforeMount () {
    _.forEach(this.getFinanceData, (values) => {
      if (values.length > this.maxValueLength) {
        this.maxValueLength = values.length
      }
    })
  },
  mounted () {
    // console.log(this.getFinanceData)
    this.expectedEps = this.getFinanceData['EPS'][5]
    this.epsPer = this.expectedEps * this.avgPer()
    // 사업 가치
    const businessValue = this.avgBusinessProfits() * ((100 - this.corporateTaxRate) / this.expectedIncomeRate)
    // 재산 가치
    const assetsValue = this.getLiquidAsset() - (this.getLiquidLiability() * 1.2) + this.getInvestmentAsset()
    this.smartInvestor = (businessValue + assetsValue - this.getFixLiability()) / this.getShareOutstandingCount() * 100000000
    this.bps = this.getBps()
    // 예상 EPS
    // 보수적
    this.epsRoe = this.expectedEps * this.getROEn3Growth()
    this.properNpdtPer = (this.getProperNetProfitDuringTheTerm() * this.avgPer() * 100000000) / this.getShareOutstandingCount()
    this.npdtPer = (this.getNetProfitDuringTheTerm() * this.avgPer() * 100000000) / this.getShareOutstandingCount()

    // 기업가치
    const companyValue = this.getEquity() + (this.getEquity() * (this.getROEn3Growth() - this.expectedIncomeRate) / this.expectedIncomeRate)
    // 유통 주식 getShareOutstandingCount
    // 자사주 getTeasuryStock
    this.srim = companyValue / (this.getShareOutstandingCount() - this.getTeasuryStock()) * 100000000

    // 매수가
    this.buyPrice = (this.getEquity() + (this.getEquity() * (this.getROEn3Growth() - this.expectedIncomeRate) / this.expectedIncomeRate) * (0.8 / (1 + this.expectedIncomeRate - 0.8))) / (this.getShareOutstandingCount() - this.getTeasuryStock()) * 100000000
    // 1차 매도가
    this.firstSellPrice = (this.getEquity() + (this.getEquity() * (this.getROEn3Growth() - this.expectedIncomeRate) / this.expectedIncomeRate) * (0.9 / (1 + this.expectedIncomeRate - 0.9))) / (this.getShareOutstandingCount() - this.getTeasuryStock()) * 100000000
  },
  methods: {
    goToSearch () {
      this.$router.push({path: '/'})
    },
    // 평균 PER
    avgPer () {
      const n = 5.0
      let total = 0
      for (let i = 0; i < n; i++) {
        total += this.getFinanceData['PER'][i]
      }
      return total / n
    },
    // 3년치 영업이익 평균
    avgBusinessProfits () {
      const n = 3.0
      let total = 0
      for (let i = 2; i < n + 2; i++) {
        total += this.getFinanceData['영업이익'][i]
      }
      return total / n
    },
    // 당기 순이익
    getNetProfitDuringTheTerm () {
      // 보수적 관점
      return this.getFinanceData['당기순이익'][4]
    },
    // 당기순이익(지배)
    getProperNetProfitDuringTheTerm () {
      // 보수적 관점
      return this.getFinanceData['당기순이익_지배'][4]
      // return this.getFinanceData['당기순이익_지배'][5]
    },
    // ROE n-3년 연송증감
    getROEn3Growth () {
      return ((this.getFinanceData['ROE'][2] * 3) + (this.getFinanceData['ROE'][3] * 2) + this.getFinanceData['ROE'][4]) / 6.0
    },
    // BPS
    getBps () {
      // 보수적 관점
      return this.getFinanceData['BPS'][4]
    },
    // 자본총계_지배
    getEquity () {
      return this.getFinanceData['자본총계_지배'][4]
    },
    // 발행 주식수(유통주식수)
    getShareOutstandingCount () {
      if (this.getFinanceData['발행주식수'].length >= 5) {
        return this.getFinanceData['발행주식수'][4]
      }
      return this.getFinanceData['발행주식수'][3]
    },
    // 자사주
    getTeasuryStock () {
      if (this.getFinanceData['자사주'] && this.getFinanceData['자사주'].length > 0) {
        return this.getFinanceData['자사주'][0]
      }
      return 0
    },
    // 유동자산
    getLiquidAsset () {
      return this.getFinanceData['유동자산'][4]
    },
    // 유동부채
    getLiquidLiability () {
      return this.getFinanceData['유동부채'][4]
    },
    // 투자자산
    getInvestmentAsset () {
      return this.getFinanceData['투자자산'][4]
    },
    // 고정부채
    getFixLiability () {
      return this.getFinanceData['고정부채'][4]
    }
  }
}
</script>
