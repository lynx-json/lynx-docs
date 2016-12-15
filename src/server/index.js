"use strict";

const http = require("http");
const url = require("url");
const getRealms = require("./get-realms");
const serveStatic = require("./serve-static");
const serveRealm = require("./serve-realm");
const serveByTemplate = require("./meta/serve-by-template");
const serveMeta = require("./meta/serve-meta");

function serveNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.write("404 Not Found");
  res.end();
}

function serveError(req, res) {
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.write("500 Server Error");
  if(req.error) {
    if(req.error.stack) res.write("\n\n" + req.error.stack);
    else res.write("\n\n" + JSON.stringify(req.error, null, 2));
  }
  res.end();
}

function reduction(acc, cv) {
  return function (req, res) {
    cv(req, res, function () {
      acc(req, res);
    });
  };
}

function startServer(options) {
  var port = options.port || 0;
  var realms = getRealms(options);

  function addRequestContext(req, res, next) {
    var parsedURL = url.parse(req.url, true);
    req.query = parsedURL.query;
    req.pathname = parsedURL.pathname;
    req.realms = realms;
    next();
  }

  function addErrorHandler(req, res, next) {
    try {
      next();
    } catch(e) {
      req.error = e;
      serveError(req, res);
    }
  }

  var handlers = [
    addRequestContext,
    addErrorHandler,
    serveMeta(options),
    serveByTemplate(options),
    serveRealm(options),
    serveStatic(options)
  ];

  var handler = handlers.reverse().reduce(reduction, serveNotFound);
  var server = http.createServer(handler).listen(port);
  console.log("Lynx Docs server is running at http://localhost:" + port);

  return server;
}

module.exports = exports = startServer;
