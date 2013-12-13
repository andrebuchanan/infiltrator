var
  moment  = require("moment-timezone"),
  redis   = require("redis"),
  util    = require("util");
var
  log     = util.log;

var _devices = {};
var _console = {};
// Redis client for adding and retrieving data.
var dclient = redis.createClient();

function now()
{
  return Math.floor(moment().valueOf() / 1000);
}

exports.getDevice = function(device, cb)
{
  dclient.MGET("device:" + device.id, cb);
}

exports.getDevices = function(params, cb)
{
  // Get all device members.
  var keys = dclient.SMEMBERS("devices", function(error, keys)
  {
    console.log("keys", keys);
    // Return matching keys to callback.
    dclient.MGET(keys, cb);
  });
}

function tos(json)
{
  return JSON.stringify(json);
}

exports.addDevice = function(device, cb)
{
  device.lastComm = now();
  dclient.SADD("devices", device.id);
  dclient.SET("device:" + device.id, tos(device));
  return [device];
}

exports.addConsoleMsg = function(message, cb)
{
  message.time = moment().valueOf();
  dclient.SADD("console:" + console.id, message.time);
  dclient.SET("console:" + console.id + ":" + message.time, tos(message));
  return message;
}

exports.getConsoleMsgs = function(device, cb)
{
  // Get all device members.
  var keys = dclient.SMEMBERS("console:" + device.id, function(error, keys)
  {
    console.log("keys", keys);
    // Return matching keys to callback.
    dclient.MGET(keys, cb);
  });
}

exports.addDevice({ id: "device1", lastComm: "123", deviceType: "ipod", status: "alive" });
exports.addDevice({ id: "device2", lastComm: "321", deviceType: "dopi", status: "evil" });
