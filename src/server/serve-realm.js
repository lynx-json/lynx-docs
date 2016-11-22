"use strict";

const fs = require("fs");
const url = require("url");
const path = require("path");
const exportYaml = require("../lib/export-vinyl");
const titleCase = require("to-title-case");

exportYaml.handler = function (options) {
  function onData(data) {
    options.output.write(data);
  }

  var buffer = fs.readFileSync(options.input);
  exportYaml.exportBuffer(buffer, onData, options);
  options.output.end();
};

function redirectToRealmIndex(req, res, next) {
  var realm = req.realms[0];
  if(!realm) return next();

  var location = url.parse(realm.realm).pathname;

  var headers = {
    "Content-Type": "text/plain",
    "Location": location,
    "Cache-control": "no-cache"
  };
  res.writeHead(301, headers);
  res.end("Redirecting to realm index");
}

function isChildOfRealm(realmUri) {
  return function (realm) {
    if(realm.realm === realmUri) return false;
    if(realm.realm.indexOf(realmUri) === -1) return false;
    return url.parse(realm.realm).pathname.split("/").length -
      url.parse(realmUri).pathname.split("/").length === 1;
  };
}

module.exports = exports = function createStaticHandler(options) {
  return function (req, res, next) {
    var realm = req.realms.find(r => url.parse(r.realm).pathname === url.parse(req.url).pathname);

    if(!realm) {
      if(req.url === "/" || req.url === "") return redirectToRealmIndex(req, res, next);
      return next();
    }

    var variants = realm.variants;
    var childRealms = req.realms.filter(isChildOfRealm(realm.realm));

    function serveRealmIndex() {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      realm.variants.forEach(variant => {
        variant.title = variant.title || titleCase(variant.name);
        variant.url = url.parse(req.url).pathname + "?variant=" + encodeURIComponent(variant.name);
      });

      exportYaml.handler({
        format: "lynx",
        input: path.join(__dirname, "realm-index.lynx.yml"),
        context: realm.folder,
        output: res,
        data: realm,
        realm: realm.realm
      });
    }

    var query = url.parse(req.url, true).query;
    var variantName = query.variant || "default";
    var variant = variants.find(v => v.name === variantName || v.content !== undefined);

    // if we have a variant to render, then render it
    if(variant) {
      if(variant.content) {
        req.filename = variant.content;
        return next();
      }

      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      return exportYaml.handler({
        format: "lynx",
        input: variant.template,
        output: res,
        data: variant.data,
        realm: realm.realm
      });
    }

    if(variants.length > 0 || childRealms.length > 0) {
      return serveRealmIndex(req, res);
    }

    next();
  };
};
