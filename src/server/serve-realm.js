"use strict";

const fs = require("fs");
const url = require("url");
const path = require("path");
const variantToLynx = require("../lib/export/variants-to-lynx").one;

function handleVariant(variant, options) {
  options.output.write(variantToLynx(variant, options));
  options.output.end();
}

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
    realm.children = req.realms.filter(isChildOfRealm(realm));
    realm.metaURL = "/meta/?realm=" + realm.realm;

    function serveRealmIndex() {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      handleVariant({
        template: path.join(__dirname, "realm-index.lynx.yml"),
        data: realm,
        realm: realm
      }, {
        format: "lynx",
        output: res,
        realm: realm
      });
    }

    function serveVariantWithAlternateIndex(variantName) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      realm.variantURL = url.parse(req.url).pathname + "?variant=" + variantName + "&direct=true";
      realm.indexURL = url.parse(req.url).pathname + "?variant=index";

      handleVariant({
        template: path.join(__dirname, "variant-with-alternate-index.lynx.yml"),
        data: realm,
        realm: realm
      }, {
        format: "lynx",
        output: res,
        realm: realm
      });
    }

    var variantName = req.query.variant || "default";
    var variant = variants.find(v => v.name === variantName || v.content !== undefined);

    if(variantName === "index" || !variant) {
      return serveRealmIndex();
    }

    if(variant.content) {
      req.filename = variant.content;
      return next();
    }

    if (!req.query.direct) {
      return serveVariantWithAlternateIndex(variantName);
    }

    res.setHeader("Content-Type", "application/lynx+json");
    res.setHeader("Cache-control", "no-cache");

    return handleVariant(variant, {
      format: "lynx",
      output: res,
      realm: realm
    });
  };
};
