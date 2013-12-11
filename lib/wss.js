// Deps.
var
  util            = require("util"),
  topic           = require("./redispubsub"),
  shoe            = require("shoe"),
  es              = require("event-stream"),
  data            = require("./data.js");
var
  log       = util.log;

//
// Socket initialisation / configuration / setup.
module.exports.listen = function(server)
{
  // Data channel for website.
  var sockPuppet = shoe(function(stream)
  {
    // So, stream requests through a pipeline, ending up back at the input stream.
    es.pipeline(
      stream,                       // Take input from socket stream.
      es.parse(),                   // JSON parse input
      es.map(function(data, done)   // Input should be a request, handle request.
      {
        handleRequest(data, function(error, response)
        {
          console.log(data, response);
          done(null, response);
        });
      }),
      es.stringify(),               // Parse response into string.
      stream                        // Return response to socket stream.
    );
  });
  // Start the sock puppet on the http server.
  sockPuppet.install(server, "/data");
};

// Handle a request and provide response data.
function handleRequest(request, callback)
{
  // Define data getter and response conversion.
  log(request.req);
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
  console.log("response", response);
  callback(null, response);
};
