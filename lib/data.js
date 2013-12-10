var
  topic   = require("./redispubsub"),
  moment  = require("moment-timezone"),
  util    = require("util");
var
  log     = util.log;

var devices = {
  "device1": { id: "device1", lastComm: "123", deviceType: "ipod", status: "alive" },
  "device2": { id: "device2", lastComm: "321", deviceType: "dopi", status: "evil" }
};
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