"use strict";

const fs = require("fs");
const url = require("url");
const path = require("path");
const variantToLynx = require("../lib/export/variants-to-lynx").one;

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

    function addRealmIndexData() {
      realm.children = req.realms.filter(isChildOfRealm(realm));
      realm.metaURL = "/meta/?realm=" + realm.realm;
    }

    function serveVariant(variant) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      var variantOptions = Object.assign({}, options, { realm: realm });

      res.write(variantToLynx(variant, variantOptions));
      res.end();
    }

    function serveRealmIndex() {
      addRealmIndexData();
      serveVariant({
        template: path.join(__dirname, "realm-index.lynx.yml"),
        data: realm
      });
    }

    function serveVariantWithAlternateIndex(variantName) {
      addRealmIndexData();
      realm.variantURL = url.parse(req.url).pathname + "?variant=" + variantName + "&direct=true";
      realm.indexURL = url.parse(req.url).pathname + "?variant=index";

      serveVariant({
        template: path.join(__dirname, "variant-with-alternate-index.lynx.yml"),
        data: realm
      });
    }

    var variantName = req.query.variant || "default";
    var variant = realm.variants.find(v => v.name === variantName || v.content !== undefined);

    if(variantName === "index" || !variant) {
      return serveRealmIndex();
    }

    if(variant.content) {
      req.filename = variant.content;
      return next();
    }

    if(!req.query.direct) {
      return serveVariantWithAlternateIndex(variantName);
    }

    return serveVariant(variant);
  };
};
