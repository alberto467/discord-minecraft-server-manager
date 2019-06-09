import { spawn } from 'child_process'
import EventEmitter from 'events'

import StreamParser from './StreamParser'

export const ServerStatus = {
  NOT_RUNNING: 'NOT_RUNNING',
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  STOPPING: 'STOPPING'
}

export default class ServerManager extends EventEmitter {
  status = ServerStatus.NOT_RUNNING

  launchServer() {
    return new Promise((fulfil, reject) => {
      if (this.status !== ServerStatus.NOT_RUNNING) return console.log('Server is already running')

      this.status = ServerStatus.STARTING
      console.log('Launching server')

      this.server = spawn('cmd.exe', [ '/c', process.env.MINECRAFT_SERVER_STARTUP_SCRIPT_PATH ])

      this.streamParser = new StreamParser({
        launched: /\[Server thread\/INFO\]: Done \(.+?\)!/,
        joined: /\[Server thread\/INFO\]: (.+?) joined the game/,
        left: /\[Server thread\/INFO\]: (.+?) left the game/
      })

      this.streamParser.on('launched', () => {
        this.status = ServerStatus.RUNNING
        console.log('Server Launched')
        return fulfil()
      })

      this.streamParser.on('joined', match => {
        this.emit('playerJoined', match[1])
        return console.log(`Player joined: ${match[1]}`)
      })

      this.streamParser.on('left', match => {
        this.emit('playerLeft', match[1])
        return console.log(`Player left: ${match[1]}`)
      })

      this.server.stdout.pipe(this.streamParser)

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