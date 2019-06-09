import { readFileSync, writeFile, existsSync } from 'fs'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

export default class ConfigManager {
  config = existsSync('config.json') ?
    JSON.parse(readFileSync('config.json', { encoding: 'utf8' })) :
    {}

  get(key, def) {
    console.log(`Getting ${key} config`)
    return key in this.config ? this.config[key] : def
  }

  async set(key, value) {
    console.log(`Setting ${key} config to ${value}`)
    this.config[key] = value
    await pWriteFile('config.json', JSON.stringify(this.config), { encoding: 'utf8' })
  }
}