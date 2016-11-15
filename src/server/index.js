"use strict";

const http = require("http");
const url = require("url");
const getRealmMetadata = require("../lib/metadata-realm");
const serveStatic = require("./serve-static");
const serveRealm = require("./serve-realm");

function serveNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.write("404 Not Found");
  res.end();
}

function serveError(req, res) {
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.write("500 Server Error");
  if (req.error) {
    res.write("\n\n" + req.error.stack);
  }
  res.end();
}

function startServer(options) {
  var port = options.port || 0;
  
  var handler = function (req, res) {
    try {
      req.realms = options.root.map(getRealmMetadata);
      serveRealm(options)(req, res, function () {
        serveStatic(options)(req, res, function () {
          serveNotFound(req, res);
        });
      });
    } catch (e) {
      req.error = e;
      serveError(req, res);
    }
  };
  
  var server = http.createServer(handler).listen(port);
  console.log("Lynx Docs server is running at http://localhost:" + port);
  
  return server;
}

module.exports = exports = startServer;
