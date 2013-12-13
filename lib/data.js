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

function tos(json)
{
  return JSON.stringify(json);
}

function getCb(cb)
{
  return cb || function() { };
}

exports.getDevice = function(device, cb)
{
  cb = getCb(cb);
  dclient.MGET("device:" + device.id, cb);
}

exports.getDevices = function(params, cb)
{
  cb = getCb(cb);
  // Get all device members.
  var keys = dclient.SMEMBERS("devices", function(error, keys)
  {
    // Return matching keys to callback.
    dclient.MGET(keys, cb);
  });
}

exports.addDevice = function(device, cb)
{
  cb = getCb(cb);
  device.lastComm = now();
  var key = "device:" + device.id;
  dclient.SADD("devices", key);
  dclient.SET(key, tos(device));
  cb(null, [device]);
}

exports.addConsoleMsg = function(message, cb)
{
  cb = getCb(cb);
  message.time = moment().valueOf();
  var key = "console:" + console.id + ":" + message.time;
  dclient.SADD("console:" + console.id, key);
  dclient.SET(key, tos(message));
  cb(null, message);
}

exports.getConsoleMsgs = function(device, cb)
{
  cb = getCb(cb);
  // Get all device members.
  var keys = dclient.SMEMBERS("console:" + device.id, function(error, keys)
  {
    console.log("keys", keys);
    // Return matching keys to callback.
    dclient.MGET(keys, cb);
  });
}

// XXXX Oh dear sweet jesus please remove me before actually using this code in anger.
dclient.on("ready", function()
{
  dclient.FLUSHDB();
  exports.addDevice({ id: "device1", lastComm: "123", deviceType: "ipod", status: "alive" });
  exports.addDevice({ id: "device2", lastComm: "321", deviceType: "dopi", status: "evil" });
});
