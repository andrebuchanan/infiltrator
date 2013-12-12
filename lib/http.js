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
  var params = req.params.id ? req.params.id : null;
  res.json(200, data.getDevices(params));
});

