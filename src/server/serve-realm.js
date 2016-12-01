"use strict";

const fs = require("fs");
const url = require("url");
const path = require("path");
const exportYaml = require("../lib/export-vinyl");

exportYaml.handler = function (options) {
  var buffer = fs.readFileSync(options.template);
  exportYaml.exportBuffer(buffer, data => options.output.write(data), options);
  options.output.end();
};

function redirectToRealmIndex(req, res, next) {
  var realm = req.realms[0];
  if(!realm) return next();

  var headers = {
    "Content-Type": "text/plain",
    "Location": realm.url,
    "Cache-control": "no-cache"
  };
  res.writeHead(301, headers);
  res.end("Redirecting to realm index");
}

function isChildOfRealm(parentRealm) {
  return function (otherRealm) {
    if(otherRealm.realm === parentRealm.realm) return false;
    if(otherRealm.realm.indexOf(parentRealm.realm) === -1) return false;
    return otherRealm.realm.split("/").length -
      parentRealm.realm.split("/").length === 1;
  };
}

module.exports = exports = function createRealmHandler(options) {
  return function (req, res, next) {
    var realm = req.realms.find(r => url.parse(r.realm).pathname === url.parse(req.url).pathname);

    if(!realm) {
      if(req.url === "/" || req.url === "") return redirectToRealmIndex(req, res, next);
      return next();
    }

    var variants = realm.variants;
    var childRealms = req.realms.filter(isChildOfRealm(realm));

    function serveRealmIndex() {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");
      
      exportYaml.handler({
        format: "lynx",
        template: path.join(__dirname, "realm-index.lynx.yml"),
        output: res,
        data: realm,
        realm: realm
      });
    }

    function serveVariantWithAlternateIndex(variantName) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      realm.variantURL = url.parse(req.url).pathname + "?variant=" + variantName + "&direct=true";
      realm.indexURL = url.parse(req.url).pathname + "?variant=index";

      exportYaml.handler({
        format: "lynx",
        template: path.join(__dirname, "variant-with-alternate-index.lynx.yml"),
        output: res,
        data: realm,
        realm: realm
      });
    }

    var query = url.parse(req.url, true).query;
    var variantName = query.variant || "default";
    var variant = variants.find(v => v.name === variantName || v.content !== undefined);

    if (variantName === "index" || !variant) {
      return serveRealmIndex();
    }

    if (variant.content) {
      req.filename = variant.content;
      return next();
    }

    if (!query.direct) {
      return serveVariantWithAlternateIndex(variantName);
    }

    res.setHeader("Content-Type", "application/lynx+json");
    res.setHeader("Cache-control", "no-cache");

    return exportYaml.handler({
      format: "lynx",
      template: variant.template,
      output: res,
      data: variant.data,
      realm: realm
    });
  };
};
