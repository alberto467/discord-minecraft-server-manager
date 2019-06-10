import 'dotenv/config'
import { Client } from 'discord.js'

import { getOnlinePlayersNumber } from './getServerInfo'
import getIp from './getIp'
import ServerManager, { ServerStatus } from './ServerManager'
import ConfigManager from './ConfigManager'

const client = new Client()

const serverManager = new ServerManager()

const configManager = new ConfigManager()

async function updateActivity() {
  if (serverManager.status === ServerStatus.RUNNING) {
    const players = await getOnlinePlayersNumber()
    await client.user.setActivity(`Minecraft with ${players} player${players !== 1 ? 's' : ''} @ ${await getIp()}:${process.env.MINECRAFT_SERVER_PORT}`, { type: 'PLAYING' })
  } else
    await client.user.setActivity(null)
}

const sendMessage = (...args) => client.channels
  .get(process.env.TEXT_CHANNEL_ID)
  .send(...args)

let autoShutdown

function setAutoShutdown() {
  const autoShutdownTime = configManager.get('autoShutdownTime', 5 * 60 * 1000)
  if (autoShutdownTime <= 0) return
  autoShutdown = setTimeout(async () => {
    await sendMessage('Automatically stopping the server due to inactivity...')
    await serverManager.stopServer()
    await sendMessage('Server stopped')
    await updateActivity()
  }, autoShutdownTime)
}

serverManager.on('playerJoined', async name => {
  clearInterval(autoShutdown)

  await sendMessage(`**${name}** joined the game`)
  await updateActivity()
})

serverManager.on('playerLeft', async name => {
  if (await getOnlinePlayersNumber() === 0) setAutoShutdown()

  await client.channels.get(process.env.TEXT_CHANNEL_ID)
    .send(`**${name}** left the game`)
  await updateActivity()
})

client.on('message', async message => {
  if (message.channel.id !== process.env.TEXT_CHANNEL_ID) return
  if (!message.content.startsWith('/')) return
  const command = message.content
    .substr(1)
    .split(' ')
    .filter(str => str.length !== 0)
  switch (command[0]) {
    case 'start':
      await message.reply('Starting the server...')
      await serverManager.launchServer()
      setAutoShutdown()
      await message.reply(`Server started @ ${await getIp()}:${process.env.MINECRAFT_SERVER_PORT}`)
      await updateActivity()
      break
    case 'stop':
      clearInterval(autoShutdown)
      await message.reply('Stopping the server...')
      await serverManager.stopServer()
      await message.reply('Server stopped')
      await updateActivity()
      break
    case 'set':
      switch (command[1]) {
        case 'autoShutdownTime': {
          const time = parseInt(command[2], 10)
          if (isNaN(time)) await message.reply('Invalid time')
          else await configManager.set('autoShutdownTime', time)
          break
        }
        default:
          await message.reply('Invalid command')
          break
      }
      break
    default:
      await message.reply('Invalid command')
      break
  }
})

client.on('ready', async () => {
  console.log('Discord bot ready')
})

client.login(process.env.DISCORD_BOT_TOKEN)