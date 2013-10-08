var
  srv = require("./lib/http");

// Port setup.
var
  port = process.argv[2] || 8080;

srv.http.listen(parseInt(port, 10));
console.log("NodeJS Express HTTP server running on port ", port);
