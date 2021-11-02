import $ from 'jquery'

export default {
  sleep (ms) {
    const wakeUpTime = Date.now() + ms
    while (Date.now() < wakeUpTime) {}
  },
  // 숫자 콤마 처리
  // util.addNumberComma(123456789.1234) -> 123,456,789.1234
  addNumberComma (value) {
    if (!$.isNumeric(value)) {
      return value
    }

    const regEx = /(^[+-]?\d+)(\d{3})/
    let returnValue = value.toString()

    while (regEx.test(returnValue)) {
      returnValue = returnValue.replace(regEx, '$1,$2')
    }

    return returnValue
  },
  // 숫자 콤마 제거 처리
  // util.removeNumberComma('123,456,789.1234'); -> 123456789.1234
  removeNumberComma (value) {
    return String(value).replace(/(,)/g, '')
  },
  subtraction (one, two, multi = 100) {
    let result = null
    if (one && two) {
      const oneF = parseFloat(one)
      const twoF = parseFloat(two)

      result = ((oneF * multi) - (twoF * multi)) / multi
    }

    return result
  }
}
