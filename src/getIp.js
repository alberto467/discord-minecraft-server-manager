import dns from 'dns'
import os from 'os'

let ip

const getIp = () => new Promise((fulfil, reject) => {
  dns.lookup(os.hostname(), (err, add) => {
    if (err) return reject(err)
    fulfil(add)
  })
})

export default async function() {
  if (ip) return ip
  ip = await getIp()
  return ip
}