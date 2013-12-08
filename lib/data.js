var
  topic   = require("./redispubsub"),
  moment  = require("moment-timezone"),
  util    = require("util");
var
  log     = util.log;

var devices = {};
topic.sub("evt/register", function(message)
{
  var regMessage = JSON.parse(message);
  devices[regMessage.id] = regMessage;
  devices[regMessage.id].lastComm = moment.utc().valueOf();
});

exports.getDevices = function(id)
{
  if (id)
  {
    return devices[id];
  }

  var devs = [];
  for (id in devices)
  {
    devs.push(devices[id]);
  }
  return devs;
}