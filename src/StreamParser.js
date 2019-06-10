import { Writable } from 'stream'

export default class StreamParser extends Writable {
  constructor(regexs) {
    super()

    this.setRegexs(regexs)
  }

  _write(data, enc, next) {
    if (Buffer.isBuffer(data))
      data = data.toString('utf8')

    for (const [ key, regex ] of this.regexs) {
      const match = data.match(regex)
      if (match) {
        this.emit(key, match)
        break
      }
    }
    next()
  }

  setRegexs(regexs) {
    this.regexs = Object.entries(regexs)
  }
}