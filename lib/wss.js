// Deps.
var
  util            = require("util"),
  topic           = require("./redispubsub"),
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
};

function handleRequest(request)
{
  topic.pub("evt/push", request);
}

//
// Use a connected socket to send a response to the connected client.
function socketSendResponse(socket, request)
{

  // Define data getter and response conversion.
  var handle = {
    "fids":       { get: store.getFIDS },
    "positions":  { get: store.getPositions },
    "aircraft":   { get: store.getAircraft },
    "otp":        { get: store.getOTP, convert: converter.convertOTP }
  };

  // Check that the data type is available to us.
  if (!handle[request.dataType])
  {
    socket.close(400, "Invalid dataType");
    return;
  }

  var handler = handle[request.dataType];
  // This will send the actual data to the requesting socket.
  var send = function()
  {
    request.query = request.query || {};
    // Use the handle to get the requested data.
    handler.get(request.query, function(error, data)
    {
      var response = request;

      // If there is a converter, convert the data.
      if (handler.convert) data = handler.convert(data);

      response.items = data.Items;
      // Only send data if the socket is open.
      log("socket readyState " + socket.readyState);
      // if (socket.readyState === WebSocket.OPEN)
      // {
        var sendString = JSON.stringify(response);
        socket.send(sendString);
      // }
    });
  };
  // Send new data right away and every two minutes.
  send();
  var timer = setInterval(send, 120000);

  // When the socket closes (client disconnect, etc), stop the periodic send.
  socket.on("close", function()
  {
    if (timer) clearTimeout(timer);
    log("socket closed");
  });
};
