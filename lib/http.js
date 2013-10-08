var
  express = require("express"),
  fs      = require("fs"),
  util    = require("util"),
  request = require("request");
var
  log     = util.log;

var // Load users file.
  users = require("../users.json");

// Test provided auth details against users.
var checkUser = function(req, res, next)
{
  var username = req.body.username || "";
  var password = req.body.password || "";
  if (username && users[username] && password && users[username].password === password)
  {
    req.session.user = users[username];
  }
  else
  {
    if (req.session) req.session.destroy();
  }
  next();
};

// Authentication check.
var authd = function(req, res, next)
{
  // Process request if user is authenticated.
  if (req.session && req.session.user)
  {
    next();
  }
  else
  {
    // Do not process request if user is not authenticated.
    res.send(401);
  }
};

// Authorization check. User wishes to perform restricted operation.
var allowd = function(req, res, next)
{
  // User can write.
  if (req.session.user.readonly === false)
  {
    next();
  }
  // User is readonly.
  else
  {
    res.send(401);
  }
};

// Grab secret from environment variable.
var hashSecret = process.env.LINKSOUP_SECRET;
// Error if there is no secret.
if (!hashSecret)
  throw "ERROR: No secret key found in env variable LINKSOUP_SECRET.";


// Framework init.
var app = express().
  use(express.bodyParser()).
  use(express.logger("dev")).
  use(express.compress()).
  use(express.static("./client/")).
  use(express.cookieParser(hashSecret)).
  use(express.session({ secret: hashSecret, key: "linksoup.sess", cookie: { path: "/", httpOnly: true, maxAge: null }})).
  use(function(req, res, next)
  {
    console.log(req.ip);
    next();
  });

//
// App callbacks here.

// Destroy session.
app.post("/dauth", function(req, res)
{
  req.session.destroy(function()
  {
    res.send(204);
  });
});
// Authentication.
app.post("/auth", checkUser, authd, function(req, res)
{
  // Assuming we get this far, the load user and authentication tests have passed. I think.
  // If that is indeed the case, do session stuff.
  var user = req.session.user;
  req.session.regenerate(function()
  {
    req.session.user = user;
    res.json({ readonly: req.session.user.readonly });
  });
});

// Return auth status.
app.post("/isauth", authd, function(req, res)
{
  res.json({ readonly: req.session.user.readonly });
});

// Return authorization status.
app.post("/isauthz", authd, allowd, function(req, res)
{
  res.send(204);
});

// Request events list from service provider.
app.get("/events", authd, function(req, res)
{
  serviceOptions.uri = soUri;
  serviceOptions.method = "GET";
  serviceOptions.qs = {
    apiKey: req.session.user.api
  };
  request(serviceOptions, function(err, resp, body)
  {
    if (err)
    {
      console.log("https req error: ", err);
      res.send(404);
      return;
    }
    res.json(body);
  });
});

// Get one event from store.
app.get("/events/:id", authd, allowd, function(req, res)
{
  serviceOptions.uri = soUri + "/" + req.params.id;
  serviceOptions.method = "GET";
  serviceOptions.qs = {
    apiKey: req.session.user.api
  };

  request(serviceOptions, function(err, resp, body)
  {
    if (err)
    {
      console.log("https req error: ", err);
      res.send(404);
      return;
    }
    console.log(body);
    res.json(body);
  });
});

// Create a new event. Operation is restricted to write-access users.
app.put("/events/:id?", authd, allowd, function(req, res)
{
  serviceOptions.uri = soUri;
  serviceOptions.method = "POST";
  // We are editing an existing event if there is id.
  if (req.params.id)
  {
    serviceOptions.uri = soUri + "/" + req.params.id;
    serviceOptions.method = "PUT";
  }
  serviceOptions.qs = {
    apiKey: req.session.user.api
  };
  // Define a model. No unwanted fields should make their way into the data source.
  serviceOptions.json = {
    name: req.body.name,
    description: req.body.description,
    start: req.body.start,
    end: req.body.end,
    type: "job"
  };
  request(serviceOptions, function(err, resp, body)
  {
    if (err)
    {
      console.log("https req error: ", err);
      res.send(404);
      return;
    }
    console.log(body);
    res.json(body);
  });
});

// Delete an event.
app.delete("/events/:id", authd, allowd, function(req, res)
{
  serviceOptions.uri = soUri + "/" + req.params.id;
  serviceOptions.method = "DELETE";
  serviceOptions.qs = {
    apiKey: req.session.user.api
  };

  request(serviceOptions, function(err, resp, body)
  {
    if (err)
    {
      console.log("https req error: ", err);
      res.send(404);
      return;
    }
    console.log(body);
    res.json(body);
  });
});

// Export the server.
exports.http = app;
