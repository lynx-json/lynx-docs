"use strict";

const fs = require("fs");
const url = require("url");
const path = require("path");
const variantToLynx = require("../lib/export/variants-to-lynx").one;
const templateToHandlebars = require("../lib/export/to-handlebars").one;

function createFile(path, content) {
  if (fs.existsSync(path)) return;
  fs.writeFileSync(path, content);
}

function redirectToRealmIndex(req, res, next) {
  var realm = req.realms[0];
  if (!realm) return next();

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

    if (!realm) {
      if (req.url === "/" || req.url === "") return redirectToRealmIndex(req, res, next);
      return next();
    }

    function serveTemplate(template) {
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Cache-control", "no-cache");

      var templateOptions = Object.assign({}, options, { realm: realm });

      res.write(templateToHandlebars(template.path, templateOptions, createFile));
      res.end();
    }

    function serveVariant(variant, includeIndexHeader) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");
      if (includeIndexHeader) res.setHeader("X-Variant-Index", url.parse(req.url).pathname + "?variant=index");

      var variantOptions = Object.assign({}, options, { realm: realm });

      res.write(variantToLynx(variant, variantOptions, createFile));
      res.end();
    }

    function serveRealmIndex() {
      serveVariant({
        template: path.join(__dirname, "realm-index.lynx.yml"),
        data: realm
      });
    }

    var template = req.query.template && realm.templates.find(t => t.path === req.query.template);
    if (template) {
      return serveTemplate(template);
    }

    var variantName = req.query.variant || "default";
    var variant = realm.variants.find(v => v.name === variantName || v.content !== undefined);

    if (variantName === "index" || !variant) {
      return serveRealmIndex();
    }

    if (variant.content) {
      req.filename = variant.content;
      return next();
    }

    return serveVariant(variant, realm.variants.length > 1);
  };
};
