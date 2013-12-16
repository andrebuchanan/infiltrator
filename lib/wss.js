// Deps.
var
  util            = require("util"),
  shoe            = require("shoe"),
  es              = require("event-stream"),
  redis           = require("redis"),
  handleRequest   = require("./reqHandler").handleRequest,
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

    var subscribed = {};
    var sclient;

    // XXX Only need one advisory per channel. We are leaking memory and creating
    // extraneous redis connections.
    var subscribe = function(channel)
    {
      if (subscribed[channel]) return;
      subscribed[channel] = true;
      log("sub request " + channel);
      if (!sclient) sclient = redis.createClient();
      sclient.SUBSCRIBE(channel);
      sclient.on("message", function(ch, message)
      {
        log("new message on channel " + ch);
        if (ch === channel) stream.write(message);
      });
    }

    var unsubscribe = function(channel)
    {
      if (!subscribed[channel]) return;
      delete subscribed[channel];
      log("unsub request");
      sclient.UNSUBSCRIBE(channel);
      sclient.quit();
    }

    // So, stream requests through a pipeline, ending up back at the input stream.
    var reqType;
    es.pipeline(
      stream,                       // Take input from socket stream.
      es.parse(),                   // JSON parse input
      es.map(function(data, done)   // Input should be a request, handle request.
      {
        if (data.sub) subscribe(data.sub);
        if (data.unsub) unsubscribe(data.unsub);
        reqType = data.req;
        handleRequest(data, function(error, response)
        {
          done(null, response);
        });
      }),
      es.stringify(),               // Parse response into string.
      es.through(function write(data) // Send data through a publish mechanism.
      {
        log(reqType);
        if (reqType) pclient.PUBLISH(reqType, data);
        this.emit("data", data);
      }),
      stream                        // Return response to socket stream.
    );

    stream.on("close", function()
    {
      log("conn closed");
      if (sclient) sclient.end();
    });
  });

  // Start the sock puppet on the http server.
  sockPuppet.install(server, "/data");
};
