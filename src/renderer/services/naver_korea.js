// import {BrowserWindow, app} from 'electron'
// import pie from 'puppeteer-in-electron'
// import puppeteer from 'puppeteer-core'
// import util from '../common/util'
import Nightmare from 'nightmare'

const electronPath = require('electron').remote.app.getPath('exe')

export default class NaverKorea {
  constructor (itemCode) {
    this.itemCode = itemCode
    this.url = `https://finance.naver.com/item/coinfo.naver?code=${itemCode}&target=finsum_more`
    this.nightmare = Nightmare({
      electronPath: electronPath,
      show: true
    })
  }

  async scrap () {
    // await pie.initialize(app)
    // const browser = await pie.connect(app, puppeteer)
    //
    // const window = new BrowserWindow()
    // await window.loadURL(this.url)
    //
    // const page = await pie.getPage(browser, window)
    // console.log(page.url())
    // // const page = await browser.newPage()
    // // await page.goto(this.url)
    //
    // util.sleep(1000)
    // window.destroy()
    await this.nightmare.goto(this.url).wait(1000).click('#cns_Tab21')
      .evaluate(() => {
        return document.querySelector('#QmZIZ20rMn').innerHTML
      })
      .end().then(
        result => console.log(result)
      )
  }
}
