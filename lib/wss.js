// Deps.
var
  util            = require("util"),
  topic           = require("./redispubsub"),
  shoe            = require("shoe"),
  es              = require("event-stream"),
  data            = require("./data.js"),
  WebSocketServer = require("ws").Server,
  WebSocket       = require("ws").WebSocket;
var
  log       = util.log;

//
// Socket initialisation / configuration / setup.
module.exports.listen = function(server)
{
  var wss = new WebSocketServer({server: server});
  wss.on("connection", function(socket)
  {
    log("ws connection");
    socket.on("message", function(message)
    {
      log("ws message " + message + "received");
      var request;
      // Parse request message.
      try
      {
        request = JSON.parse(message);
        topic.pub("evt/" + request.mType, message);
      }
      catch(e)
      {
        log(e);
        socket.close(400, "Invalid JSON format");
      }

      handleRequest(message);
    });
  });

  // Data channel for website.
  var sockPuppet = shoe(function(stream)
  {
    // So, stream requests through a pipeline, ending up back at the input stream.
    es.pipeline(
      stream,                       // Take input from socket stream.
      es.parse(),                   // JSON parse input
      es.map(function(data, done)   // Input should be a request, handle request.
      {
        var response = handleRequest(data);
        done(null, response);
      }),
      es.stringify(),               // Parse response into string.
      stream                        // Return response to socket stream.
    );
  });
  // Start the sock puppet on the http server.
  sockPuppet.install(server, "/data");
};

// Handle a request and provide response data.
function handleRequest(request)
{
  // Define data getter and response conversion.
  var handle = {
    "device": data.getDevices,
  };

  // Check that the data type is available to us.
  if (!handle[request.req])
  {
    return [];
  }

  return handle[request.req]();
};
