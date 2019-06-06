"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _dns = _interopRequireDefault(require("dns"));

var _os = _interopRequireDefault(require("os"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ip;

const getIp = () => new Promise((fulfil, reject) => {
  _dns.default.lookup(_os.default.hostname(), (err, add) => {
    if (err) return reject(err);
    fulfil(add);
  });
});

async function _default() {
  if (ip) return ip;
  ip = await getIp();
  return ip;
}