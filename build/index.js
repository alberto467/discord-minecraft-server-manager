"use strict";

var _discord = require("discord.js");

var _getServerInfo = require("./getServerInfo");

var _getIp = _interopRequireDefault(require("./getIp"));

var _ServerManager = _interopRequireWildcard(require("./ServerManager"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const client = new _discord.Client();
const serverManager = new _ServerManager.default();

async function updateActivity() {
  if (serverManager.status === _ServerManager.ServerStatus.RUNNING) {
    const players = await (0, _getServerInfo.getOnlinePlayersNumber)();
    await client.user.setActivity(`Minecraft with ${players} player${players !== 1 ? 's' : ''} @ ${await (0, _getIp.default)()}:${process.env.MINECRAFT_SERVER_PORT}`, {
      type: 'PLAYING'
    });
  } else await client.user.setActivity(null);
}

client.on('message', async message => {
  if (message.channel.id !== process.env.TEXT_CHANNEL_ID) return;
  if (!message.content.startsWith('/')) return;
  const command = message.content.substr(1).trim();

  switch (command) {
    case 'start':
      await message.reply('Starting the server...');
      await serverManager.launchServer();
      await message.reply(`Server started @ ${await (0, _getIp.default)()}:${process.env.MINECRAFT_SERVER_PORT}`);
      await updateActivity();
      break;

    case 'stop':
      await message.reply('Stopping the server...');
      await serverManager.stopServer();
      await message.reply('Server stopped');
      await updateActivity();
      break;

    default:
      break;
  }
});
client.on('ready', async () => {
  console.log('Discord bot ready');
  updateActivity();
  setInterval(() => {
    updateActivity();
  }, 30 * 1000);
});
client.login(process.env.DISCORD_BOT_TOKEN);