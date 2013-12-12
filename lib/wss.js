// Deps.
var
  util            = require("util"),
  shoe            = require("shoe"),
  es              = require("event-stream"),
  data            = require("./data.js"),
  redis           = require("redis"),
  pclient         = redis.createClient();
var
  log       = util.log;

//
// Socket initialisation / configuration / setup.
module.exports.listen = function(server)
{
  // Data channel for website.
  var sockPuppet = shoe(function(stream)
  {

    var subscribed = false;
    var sclient;

    var subscribe = function(channel)
    {
      if (subscribed) return;
      subscribed = !subscribed;
      log("sub request");
      sclient = redis.createClient();
      sclient.SUBSCRIBE(channel);
      sclient.on("message", function(ch, message)
      {
        log("new message on channel " + ch);
        if (ch === channel) stream.write(message);
      });
    }

    // So, stream requests through a pipeline, ending up back at the input stream.
    var reqType;
    es.pipeline(
      stream,                       // Take input from socket stream.
      es.parse(),                   // JSON parse input
      es.map(function(data, done)   // Input should be a request, handle request.
      {
        if (data.sub) subscribe(data.sub);
        reqType = data.req;
        handleRequest(data, function(error, response)
        {
          done(null, response);
        });
      }),
      es.stringify(),               // Parse response into string.
      es.through(function write(data)
      {
        if (reqType) pclient.PUBLISH(reqType, data);
        this.emit("data", data);
      }),
      stream                        // Return response to socket stream.
    );
  });

  // Start the sock puppet on the http server.
  sockPuppet.install(server, "/data");

  sockPuppet.on("close", function()
  {
    log("conn closed");
    if (sclient) sclient.close();
  });
};

// Handle a request and provide response data.
function handleRequest(request, callback)
{
  // Define data getter and response conversion.
  var handle = {
    "device": data.getDevices,
    "register": data.addDevice
  };

  // Check that the data type is available to us.
  if (!handle[request.req])
  {
    callback("Invalid handle", []);
    return;
  }

  var response = handle[request.req](request);
  // var publish = rclient.stream("PUBLISH", "device");
  // publish.pipe(stream);
  // publish.write(JSON.stringify(response));
  callback(null, response);
};
