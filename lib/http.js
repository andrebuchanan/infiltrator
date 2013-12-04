var
  express         = require("express"),
  topic           = require("./redispubsub"),
  data            = require("./data"),
  util            = require("util");
var
  log             = util.log;

// Grab secret from environment variable.
var hashSecret = process.env.INFILTRATOR_SECRET;
// Error if there is no secret.
if (!hashSecret)
  throw "ERROR: No secret key found in env variable INFILTRATOR_SECRET.";


// Framework init.
var app = express().
  use(express.bodyParser()).
  use(express.logger("dev")).
  use(express.compress()).
  use(express.static("./client/")).
  use(express.cookieParser(hashSecret)).
  use(express.session({ secret: hashSecret, key: "infiltrator.sess", cookie: { path: "/", httpOnly: true, maxAge: null }})).
  use(function(req, res, next)
  {
    log(req.ip);
    next();
  });

// Export the server.
module.exports = app;

app.get("/device", function(req, res)
{
  res.json(200, data.getDevices());
});



// Event long poll thing.
app.get("/evt", function(req, res)
{
  // These are async handles. When a handle fires, all must be shut down to avoid
  // sending the response twice.
  var tm, topicName,
  off = function()
  {
    topic.unsub("evt/push");
    if (tm !== undefined) clearTimeout(tm);
  };

  // By default respond after 30 seconds. No events.
  tm = setTimeout(function()
  {
    off(); // Remove all handles.
    res.json({ type: "noop" });
  }, 30000);

  // Set up function for event push.
  topic.sub("evt/push", function(messages)
  {
    off(); // Remove all handles.
    log("sending event data to " + req.ip + ": " + messages);
    res.send(200, messages);
  });
});
