<template>
  <div class="container is-fluid">
    <h3 class="title is-3">종목 적정가 분석</h3>
    <webview src="https://www.naver.com/"
             style="width:500px;height:500px"
             userAgent="Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36">
    </webview>
  </div>
</template>

<script>
import util from '../common/util'

export default {
  name: 'naver-webview',
  data: () => ({
    itemCode: null,
    webview: null,
    finUrl: null
  }),
  created () {
    this.itemCode = this.$route.query.itemCode
    this.finUrl = `https://finance.naver.com/item/coinfo.naver?code=${this.itemCode}&target=finsum_more`
  },
  async mounted () {
    this.webview = document.querySelector('webview')
    await this.loadPageUrl(this.finUrl)
    this.getFinanceData()
  },
  computed: {
  },
  methods: {
    loadPageUrl (url) {
      return new Promise(resolve => {
        const loadPage = () => {
          this.webview.loadURL(url)
          this.webview.removeEventListener('dom-ready', loadPage)
          resolve()
        }
        this.webview.addEventListener('dom-ready', loadPage)
      })
    },
    getFinanceData () {
      this.webview.addEventListener('dom-ready', async () => {
        util.sleep(2000)
        let currentURL = this.webview.getURL()
        console.log('currentURL is : ' + currentURL)

        // same thing about the title of the page
        let titlePage = this.webview.getTitle()
        console.log('titlePage is : ' + titlePage)

        this.webview.executeJavaScript(`document.documentElement.innerHTML`).then((result) => {
          console.log(result)
        })
        // await this.checkElementLoaded('#cns_Tab21')
      })
    },
    async checkElementLoaded (selector) {
      try {
        // const result = await this.webview.executeJavaScript(`function checkElementLoaded () {
        //       return new Promise((resolve, reject) => { resolve(!!document.querySelector('${selector}')); });
        //     }
        //     checkElementLoaded();`)
        const result = await this.webview.executeJavaScript(`function checkElementLoaded () {
              return new Promise((resolve, reject) => { resolve(document.documentElement.innerHTML); });
            }
            checkElementLoaded();`)
        console.log(result)
      } catch (e) {
        console.error('checkElementLoaded error', e)
      }
    }
  }
}
</script>
