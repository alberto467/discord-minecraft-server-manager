import { Client } from 'discord.js'

import { getOnlinePlayersNumber } from './getServerInfo'
import getIp from './getIp'
import ServerManager, { ServerStatus } from './ServerManager'

const client = new Client()

const serverManager = new ServerManager()

async function updateActivity() {
  if (serverManager.status === ServerStatus.RUNNING) {
    const players = await getOnlinePlayersNumber()
    await client.user.setActivity(`Minecraft with ${players} player${players !== 1 ? 's' : ''} @ ${await getIp()}:${process.env.MINECRAFT_SERVER_PORT}`, { type: 'PLAYING' })
  } else
    await client.user.setActivity(null)
}

serverManager.on('playerJoined', async name => {
  await client.channels.get(process.env.TEXT_CHANNEL_ID)
    .send(`**${name}** joined the game`)
})

serverManager.on('playerLeft', async name => {
  await client.channels.get(process.env.TEXT_CHANNEL_ID)
    .send(`**${name}** left the game`)
})

client.on('message', async message => {
  if (message.channel.id !== process.env.TEXT_CHANNEL_ID) return
  if (!message.content.startsWith('/')) return
  const command = message.content.substr(1).trim()
  switch (command) {
    case 'start':
      await message.reply('Starting the server...')
      await serverManager.launchServer()
      await message.reply(`Server started @ ${await getIp()}:${process.env.MINECRAFT_SERVER_PORT}`)
      await updateActivity()
      break
    case 'stop':
      await message.reply('Stopping the server...')
      await serverManager.stopServer()
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
})

client.login(process.env.DISCORD_BOT_TOKEN)