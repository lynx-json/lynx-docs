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

function startServer(options) {
  var port = options.port || 0;
  
  var handler = function (req, res) {
    req.realms = options.root.map(getRealmMetadata);
    serveRealm(options)(req, res, function () {
      serveStatic(options)(req, res, function () {
        serveNotFound(req, res);
      });
    });
  };
  
  var server = http.createServer(handler).listen(port);
  console.log("Lynx Docs server is running at http://localhost:" + port);
  
  return server;
}

module.exports = exports = startServer;
