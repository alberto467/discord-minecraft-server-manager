import { promisify } from 'util'
import mcping from 'mc-ping-updated'

const pMcping = promisify(mcping)

export async function getOnlinePlayersNumber() {
  console.log('Checking number of players online')
  const res = await pMcping('127.0.0.1', process.env.MINECRAFT_SERVER_PORT)
  const players = res.players.online
  console.log('Players on server: ', players)
  return players
}