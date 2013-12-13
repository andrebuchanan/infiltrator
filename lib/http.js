var
  express         = require("express"),
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

app.get("/device/:id?", function(req, res)
{
  var func = req.params.id ? data.getDevice : data.getDevices;
  func(req.params, function(error, data)
  {
    console.log(data);
    res.json(200, data);
  });
});

app.get("/device/console/:id", function(req, res)
{
  data.getConsoleMsgs(req.params, function(error, data)
  {
    res.json(200, data);
  });
});

