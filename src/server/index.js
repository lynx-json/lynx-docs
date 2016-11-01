"use strict";

const http = require("http");
const url = require("url");
const getRealmMetadata = require("../lib/metadata-realm");
const serveStatic = require("./serve-static");

function serveNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.write("404 Not Found");
  res.end();
}

function generateRealmOrVariantUrl(realmOrVariant) {
  // create an address for the realm or variant object
  if (realmOrVariant.type === "variant") {
    var realmUrl = generateRealmOrVariantUrl( realmOrVariant.parent );
    var variantUrl = url.parse(realmUrl).pathname + "?variant=" + encodeURIComponent(realmOrVariant.name);
    return variantUrl;
  }
  else {
    return url.parse(realmOrVariant.realm).pathname;
  }
}

function isRequestForRealmOrVariant(requestUrl, realmOrVariantUrl) {
  return url.parse(requestUrl).pathname === url.parse(realmOrVariantUrl).pathname;
}

function realmOrVariantMatchesRequestUrl(requestUrl) {
  return function (realmOrVariant) {
    var realmOrVariantUrl = generateRealmOrVariantUrl(realmOrVariant);
    return isRequestForRealmOrVariant(requestUrl, realmOrVariantUrl);
  };
}

function serveRealm(req, res, next) {
  var realmOrVariant = req.realms.find(realmOrVariantMatchesRequestUrl(req.url));
  if (!realmOrVariant) next();
  // convert previous impl to serve the realm or call next()
}

function startServer(options) {
  var port = options.port || 0;
  
  var handler = function (req, res) {
    req.realms = options.root.map(getRealmMetadata);
    serveRealm(req, res, function () {
      serveStatic(req, res, function () {
        serveNotFound(req, res);
      });
    });
  };
  
  var server = http.createServer(handler).listen(port);
  console.log("Lynx Docs server is running at http://localhost:" + port);
  
  return server;
}

module.exports = exports = startServer;
