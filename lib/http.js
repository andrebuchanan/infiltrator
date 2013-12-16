var
  express         = require("express"),
  handleRequest   = require("./reqHandler").handleRequest,
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

//
// Get defined route params.
function paramParse(req, res, next)
{
  var params = {};
  for (param in req.params)
  {
    if (req.params[param] !== undefined) params[param] = req.params[param];
  }
  // Grab params from url. dataType is content between first / and second /
  params.req = req.url.substring(1, req.url.indexOf("/", 1));

  // Rewrite params.
  req.params = params;
  next();
};

//
// Handle request and response.
function doRequest(req, res, next)
{
  log(req.url);

  // Use request handler to deal with request in standard manner.
  handleRequest(req.params, function(error, data)
  {
    if (error)
    {
      log(error);
      res.json(400, error);
      return;
    }
    res.json(200, data);
  });
};

//
// function(req, res, next)
// {
//   req.params.req = req.params.id ? "device" : "devices";
//   next();
// },
app.use(paramParse, doRequest);
app.get("/device/:id?", paramParse, doRequest);

// From this point on, always use these middlewares.

app.get("/consoles/:id", paramParse, doRequest);

