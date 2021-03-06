"use strict";

const path = require("path");
const http = require("http");
const url = require("url");
const getRealms = require("./get-realms");
const serveCors = require("./serve-cors");
const serveStatic = require("./serve-static");
const serveRealm = require("./serve-realm");
const searchMeta = require("./meta/search-meta");
const serveMeta = require("./meta/serve-meta");
const serveImages = require("./serve-images");
const log = require("logatim");

function serveNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.write("404 Not Found");
  res.end();
}

function serveError(req, res) {
  res.writeHead(500, { "Content-Type": "text/plain" });
  res.write("500 Server Error");
  if (req.error) {
    if (req.error.stack) res.write("\n\n" + req.error.stack);
    else {
      res.write("\n\n".concat(req.error.message));
      res.write("\n\nError object details:\n".concat(JSON.stringify(req.error, null, 2)));
    }
  }
  res.end();
}

function reduction(acc, cv) {
  return function (req, res) {
    cv(req, res, function () {
      try {
        acc(req, res);
      } catch (e) {
        req.error = e;
        serveError(req, res);
      }
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

  var handlers = [
    addRequestContext,
    serveCors(options)
  ];

  if (Array.isArray(options.handlers)) {
    options.handlers.forEach(function (handler) {
      if (handler.indexOf(".") === 0) {
        handler = path.resolve(handler);
      }
      handlers.push(require(handler));
    });
  }

  handlers = handlers.concat([
    serveImages,
    serveMeta(options),
    searchMeta(options),
    serveStatic(options),
    serveRealm(options)
  ]);

  var handler = handlers.reverse().reduce(reduction, serveNotFound);
  var server = http.createServer(handler).listen(port);
  console.log(log.green("Lynx Docs server is running at http://localhost:" + port).raw());

  return server;
}

module.exports = exports = startServer;
