var request = require("request");

describe("API test", function()
{
  it("should not error", function(asyncDone)
  {
    var devices;
    // Call device API.
    request("http://localhost:8889/device/", function(error, res, body)
    {
      asyncDone(error);
    });
  });
});