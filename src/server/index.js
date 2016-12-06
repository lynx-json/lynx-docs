"use strict";

const http = require("http");
const url = require("url");
const getRealmMetadata = require("../lib/metadata-realm");
const serveStatic = require("./serve-static");
const serveRealm = require("./serve-realm");
// const serveMeta = require("./serve-meta");
const titleCase = require("to-title-case");

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

function startServer(options) {
  var port = options.port || 0;

  var handler = function (req, res) {
    try {
      var parsedURL = url.parse(req.url, true);
      req.query = parsedURL.query;
      req.pathname = parsedURL.pathname;
      req.realms = getRealms(options);
      serveRealm(options)(req, res, function () {
        // serveMeta(options)(req, res, function () {
          serveStatic(options)(req, res, function () {
            serveNotFound(req, res);
          })
        // })
      });
    } catch(e) {
      req.error = e;
      serveError(req, res);
    }
  };

  var server = http.createServer(handler).listen(port);
  console.log("Lynx Docs server is running at http://localhost:" + port);

  return server;
}

function getRealms(options) {
  var realms = getRealmMetadata(options.root);

  realms.forEach(realm => {
    realm.url = realm.url || url.parse(realm.realm).pathname;
    realm.variants.forEach(variant => {
      variant.title = variant.title || titleCase(variant.name);
      variant.url = variant.url || urlForVariant(realm, variant);
    });
  });

  return realms;
}

function urlForVariant(realm, variant) {
  return realm.url + "?variant=" + encodeURIComponent(variant.name);
}

module.exports = exports = startServer;
