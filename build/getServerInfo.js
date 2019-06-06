"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOnlinePlayersNumber = getOnlinePlayersNumber;

var _util = require("util");

var _mcPingUpdated = _interopRequireDefault(require("mc-ping-updated"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pMcping = (0, _util.promisify)(_mcPingUpdated.default);

async function getOnlinePlayersNumber() {
  console.log('Checking number of players online');
  const res = await pMcping('127.0.0.1', process.env.MINECRAFT_SERVER_PORT);
  const players = res.players.online;
  console.log('Players on server: ', players);
  return players;
}