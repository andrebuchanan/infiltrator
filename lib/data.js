var
  moment  = require("moment-timezone"),
  redis   = require("redis"),
  util    = require("util");
var
  log     = util.log;

// Redis client for adding and retrieving data.
var dclient = redis.createClient();

// Handle connection errors.
dclient.on("error", function()
{
  // I think we'll just rethrow with a connection error message for the moment.
  var msg = "Cannot establish connection to redis server."
  throw msg;
});

// Return current time epoch.
function now()
{
  return Math.floor(moment().valueOf() / 1000);
}

// Stringify data prior to storing.
function tos(json)
{
  return JSON.stringify(json);
}

function check(fn, params, cb)
{
  cb = cb || function() { };
  if (!dclient.connected)
  {
    log("no connection");
    return false;
  }
  fn.call(null, params, cb);
}

exports.getDevice = check.bind(null, getDevice);
function getDevice(device, cb)
{
  dclient.MGET("device:" + device.id, cb);
}

exports.getDevices = check.bind(null, getDevices);
function getDevices(params, cb)
{
  if (params.id)
  {
    dclient.MGET("device:" + params.id, cb);
    return;
  }
  // Get all device members.
  var keys = dclient.SMEMBERS("devices", function(error, keys)
  {
    // Return matching keys to callback.
    dclient.MGET(keys, cb);
  });
}

exports.addDevice = check.bind(null, addDevice);
function addDevice(device, cb)
{
  device.lastComm = now();
  var key = "device:" + device.id;
  dclient.SADD("devices", key);
  var devString = tos(device);
  dclient.SET(key, devString);
  cb(null, [devString]);
}

exports.addConsoleMsg = check.bind(null, addConsoleMsg);
function addConsoleMsg(message, cb)
{
  message.time = moment().valueOf();
  var key = "console:" + message.id + ":" + message.time;
  dclient.SADD("console:" + message.id, key);
  var msgString = tos(message);
  dclient.SET(key, msgString);
  cb(null, [msgString]);
}

exports.getConsoleMsgs = check.bind(null, getConsoleMsgs);
function getConsoleMsgs(device, cb)
{
  // Get all device members.
  var keys = dclient.SMEMBERS("console:" + device.id, function(error, keys)
  {
    console.log("keys", keys);
    // Return matching keys to callback.
    if (keys.length > 0)
    {
      dclient.MGET(keys, cb);
      return;
    }
    cb(null, []);
  });
}

// XXXX Oh dear sweet jesus please remove me before actually using this code in anger.
dclient.on("ready", function()
{
  dclient.FLUSHDB();
  exports.addDevice({ id: "device1", lastComm: "123", deviceType: "ipod", status: "alive" });
  exports.addDevice({ id: "device2", lastComm: "321", deviceType: "dopi", status: "evil" });
});
