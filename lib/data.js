var
  moment  = require("moment-timezone"),
  util    = require("util");
var
  log     = util.log;

var _devices = {};
var _console = {};

function now()
{
  return Math.floor(moment().valueOf() / 1000);
}

exports.getDevice = function(device)
{
  return [_devices[device.id] ? _devices[device.id] : {}];
}

exports.getDevices = function()
{
  var devs = [];
  for (id in _devices)
  {
    devs.push(_devices[id]);
  }
  return devs;
}

exports.addDevice = function(device)
{
  device.lastComm = now();
  _devices[device.id] = device;
  return [device];
}

exports.addConsoleMsg = function(message)
{
  message.time = now();
  if (!_console[message.id]) _console[message.id] = [];
  _console[message.id].push(message);
  return message;
}

exports.getConsoleMsgs = function(device)
{
  return _console[device.id] ? _console[device.id] : [];
}

exports.addDevice({ id: "device1", lastComm: "123", deviceType: "ipod", status: "alive" });
exports.addDevice({ id: "device2", lastComm: "321", deviceType: "dopi", status: "evil" });
