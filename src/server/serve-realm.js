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

module.exports = exports = function createRealmHandler(options) {
  return function (req, res, next) {
    var realm = req.realms.find(r => url.parse(r.realm).pathname === url.parse(req.url).pathname);

    if(!realm) {
      if(req.url === "/" || req.url === "") return redirectToRealmIndex(req, res, next);
      return next();
    }

    function serveVariant(variant) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      var variantOptions = Object.assign({}, options, { realm: realm });

      res.write(variantToLynx(variant, variantOptions));
      res.end();
    }

    function serveRealmIndex() {
      serveVariant({
        template: path.join(__dirname, "realm-index.lynx.yml"),
        data: realm
      });
    }

    function serveVariantWithAlternateIndex(variantName) {
      var data = {
        variantURL: url.parse(req.url).pathname + "?variant=" + variantName + "&direct=true",
        indexURL: url.parse(req.url).pathname + "?variant=index"
      };

      serveVariant({
        template: path.join(__dirname, "variant-with-alternate-index.lynx.yml"),
        data: Object.assign(data, realm)
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
