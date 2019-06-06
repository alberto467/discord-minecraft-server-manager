import { spawn } from 'child_process'

export const ServerStatus = {
  NOT_RUNNING: 'NOT_RUNNING',
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  STOPPING: 'STOPPING'
}

export default class ServerManager {
  status = ServerStatus.NOT_RUNNING

  launchServer() {
    return new Promise((fulfil, reject) => {
      if (this.status !== ServerStatus.NOT_RUNNING) return console.log('Server is already running')

      this.status = ServerStatus.STARTING
      console.log('Launching server')

      this.server = spawn('cmd.exe', [ '/c', 'C:\\Users\\alberto467\\Desktop\\minecraft-server\\start.cmd' ])

      this.server.stdout.on('data', data => {
        if (!data.toString('utf8').match(/\[Server thread\/INFO\]: Done \(.+?\)!/)) return
        this.server.stdout.removeAllListeners('data')
        this.status = ServerStatus.RUNNING
        console.log('Server Launched')
        fulfil()
      })

      this.server.on('exit', code => {
        if (code !== 0)
          reject(new Error(`Process exited with code ${code}`))
        this.server = null
      })
    })
  }

  stopServer() {
    return new Promise(fulfil => {
      if (this.status !== ServerStatus.RUNNING) return console.log('Server is not running')

      this.status = ServerStatus.STOPPING
      console.log('Stopping the server')

      this.server.on('exit', code => {
        if (code === 0) {
          this.status = ServerStatus.NOT_RUNNING
          console.log('Server stopped')
          fulfil()
        }
      })

      this.server.stdin.write('stop\n')
      this.server.stdin.end()
    })
  }
}