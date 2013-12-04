var
  topic           = require("./redispubsub"),
  util            = require("util");
var
  log             = util.log;

var devices = {};
topic.sub("evt/register", function(message)
{
  var regMessage = JSON.parse(message);
  devices[regMessage.id] = regMessage;
});

exports.getDevices = function()
{
  var devs = [];
  for (id in devices)
  {
    devs.push(devices[id]);
  }
  return devs;
}