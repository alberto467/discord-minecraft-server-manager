import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import dns from 'dns'
import os from 'os'
import { Client } from 'discord.js'
import mcping from 'mc-ping-updated'

const pExec = promisify(exec)
const pMcping = promisify(mcping)

const client = new Client()

const getIp = () => new Promise((fulfil, reject) => {
  dns.lookup(os.hostname(), (err, add) => {
    if (err) return reject(err)
    fulfil(add)
  })
})

async function isServerRunning() {
  console.log('Checking if server is running')
  try {
    const { stdout, stderr } = await pExec('"C:\\Program Files (x86)\\Java\\jdk1.8.0_131\\bin\\jps.exe" -l | find "minecraft-server.jar"', { shell: true })
    if (stderr.trim().length) throw new Error(stderr)
    const pid = stdout.trim().split(' ')[0]
    console.log('Server is running with pid: ', pid)
    return pid
  } catch (e) {
    console.log('Server is not running')
    return false
  }
}

async function getOnlinePlayersNumber() {
  console.log('Checking number of players online')
  const res = await pMcping('127.0.0.1', 25565)
  const players = res.players.online
  console.log('Players on server: ', players)
  return players
}

// 0 Not running
// 1 Starting
// 2 Running
// 3 Stopping
let serverStatus = 0
let server

let ip

const launchServer = () => new Promise((fulfil, reject) => {
  if (serverStatus !== 0) return console.log('Server is already running')
  serverStatus = 1
  console.log('Launching server')
  server = spawn('cmd.exe', [ '/c', 'C:\\Users\\alberto467\\Desktop\\minecraft-server\\start.cmd' ])
  server.stdout.on('data', data => {
    if (!data.toString('utf8').match(/\[Server thread\/INFO\]: Done \(.+?\)!/)) return
    server.stdout.removeAllListeners()
    serverStatus = 2
    console.log('Server Launched')
    fulfil()
  })
  server.on('exit', code => {
    if (code !== 0)
      reject(new Error(`Process exited with code ${code}`))
    server = null
  })
})

const stopServer = () => new Promise((fulfil, reject) => {
  if (serverStatus !== 2) return console.log('Server is not running')
  serverStatus = 3
  console.log('Stopping the server')
  server.on('exit', code => {
    if (code === 0) {
      serverStatus = 0
      console.log('Server stopped')
      fulfil()
    } else reject(new Error(`Process exited with code ${code}`))
  })
  server.stdin.write('stop\n')
  server.stdin.end()
})

async function updateActivity() {
  if (serverStatus === 2) {
    const players = await getOnlinePlayersNumber()
    await client.user.setActivity(`Minecraft with ${players} player${players !== 1 ? 's' : ''} @ ${ip}:25565`, { type: 'PLAYING' })
  } else
    await client.user.setActivity(null)
}

client.on('message', async message => {
  if (message.channel.id !== process.env.TEXT_CHANNEL_ID) return
  if (!message.content.startsWith('/')) return
  const command = message.content.substr(1).trim()
  switch (command) {
    case 'start':
      await message.reply('Starting the server...')
      await launchServer()
      await message.reply(`Server started @ ${ip}:25565`)
      await updateActivity()
      break
    case 'stop':
      await message.reply('Stopping the server...')
      await stopServer()
      await message.reply('Server stopped')
      await updateActivity()
      break
    default:
      break
  }
})

client.on('ready', async () => {
  console.log('Discord bot ready')

  updateActivity()
  setInterval(() => {
    updateActivity()
  }, 30 * 1000)
});

(async () => {
  if (await isServerRunning())
    return console.log('Server is already running... shutting down')

  ip = await getIp()
  await client.login(process.env.DISCORD_BOT_TOKEN)
})()
