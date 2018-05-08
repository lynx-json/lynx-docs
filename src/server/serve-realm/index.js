"use strict";

const url = require("url");
const path = require("path");

function redirectToSearch(req, res, next) {
  var headers = {
    "Content-Type": "text/plain",
    "Location": "/meta/search/?q=" + url.parse(req.url).pathname,
    "Cache-control": "no-cache"
  };
  res.writeHead(301, headers);
  res.end("Redirecting to search");
}

module.exports = exports = function createRealmHandler(options) {
  const serveTemplate = require("./serve-template")(options);
  const serveVariant = require("./serve-variant").variant(options);
  const serveVariantIndex = require("./serve-variant").index(options);
  const serveFile = require("../serve-file")(options);

  return function (req, res, next) {

    let variantSegment, realmPath, pathname = url.parse(req.url).pathname;
    let lastPathSep = pathname.lastIndexOf("/");
    if (lastPathSep !== (pathname.length - 1) && !path.extname(pathname)) {
      realmPath = pathname.substring(0, lastPathSep + 1);
      variantSegment = pathname.substring(lastPathSep + 1);
    }

    let realms = req.realms.filter(r => r.url === (realmPath || pathname));

    if (realms.length === 0) {
      if (req.url === "/" || req.url === "") return redirectToSearch(req, res, next);
      return next();
    }

    if (req.query.template) {
      var result = realms.reduce(function (acc, realm) {
        if (acc) return acc;
        let template = realm.templates.find(t => t.path === req.query.template);
        if (template) return { template: template, realm: realm };
      }, null);

      if (result) {
        return serveTemplate(result.template, result.realm, options)(req, res, next);
      }
    }

    var variantName = req.query.variant || variantSegment || "default";
    let results = realms.reduce((acc, realm) => {
      let variant = realm.variants.find(v => v.name === variantName || v.content !== undefined);
      if (variant) acc.push({ variant: variant, realm: realm });
      return acc;
    }, []);

    if (results.length !== 1 || variantName === "index") {
      return serveVariantIndex(realms)(req, res, next);
    }

    let variant = results[0].variant;
    if (variant.content) return serveFile(variant.content)(req, res, next);

    return serveVariant(variant, results[0].realm)(req, res, next);
  };
};
