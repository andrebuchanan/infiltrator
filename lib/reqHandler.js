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

  var reqType = request.req;
  delete request.req;
  handle[reqType](request, function(error, data)
  {
    var response = { req: reqType };
    response[reqType] = [];
    if (data)
    {
      console.log(data);
      response[reqType] = data;
    }
    callback(error, response);
  });
};
