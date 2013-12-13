// Deps.
var
  util            = require("util"),
  ws              = require("ws");
var
  log       = util.log;

var wsClient = new ws("ws://localhost:8888/data/websocket", {
  origin: "localhost:8888"
});

wsClient.on("error", function(error)
{
  console.trace();
  log(error);
  log(util.inspect(wsClient.supports));
});

wsClient.on("open", function()
{
  var sends = [
    // {
    //   sub: "register"
    // },
    {
      "req": "register",
      "id": "new device",
      "deviceType": "android",
      "status": "dead"
    },
    // {
    //   unsub: "register"
    // }
    {
      req: "console",
      id: "device1",
      console: "This is a message"
    }
  ];

  sends.forEach(function(msg)
  {
    setTimeout(function()
    {
      wsClient.send(JSON.stringify(msg));
    }, 1000);
  });
});

wsClient.on("message", function(data, flags)
{
  log("client got message of length: " + data.length);
  log("message head: " + data.substr(0, 50));
});
