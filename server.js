var
  wss     = require("./lib/wss"),
  srv     = require("./lib/http"),
  // Http request handler.
  server  = require("http").createServer(srv);

// Web socket handler.
var
  wsHandler   = wss.listen(server);

// Port setup.
var port = process.argv[2] || 8080;
// Start the http server.
server.listen(parseInt(port, 10));

console.log("Infiltrator running on ", port);
