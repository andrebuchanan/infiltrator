var data = require("./data.js");

// Handle a request and provide response data.
exports.handleRequest = function(request, callback)
{
  console.log(request);
  // Define data getter and response conversion.
  var handle = {
    "devices": data.getDevices,
    "register": data.addDevice,
    "console": data.addConsoleMsg,
    "device": data.getDevices,
    "consoles": data.getConsoleMsgs
  };

  // Check that the data type is available to us.
  if (!handle[request.req])
  {
    callback("Invalid handle", []);
    return;
  }

  handle[request.req](request, function(error, data)
  {
    var response = { req: request.req };
    response[request.req] = [];
    if (data)
    {
      data.forEach(function(record)
      {
        response[request.req].push(JSON.parse(record));
      });
    }
    callback(error, response);
  });
};
