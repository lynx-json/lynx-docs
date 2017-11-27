"use strict";

const fs = require("fs");
const url = require("url");
const path = require("path");
const variantToLynx = require("../lib/export/variants-to-lynx").one;
const templateToHandlebars = require("../lib/export/to-handlebars").one;
const log = require("logatim");

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
    
    function serveTemplateDataVariant(variant) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      var variantOptions = Object.assign({}, options, { realm: realm });

      res.write(variantToLynx(variant, variantOptions, createFile));
      res.end();
    }
    
    function serveJavaScriptVariant(variant) {
      var javascriptModuleName = variant.jsmodule;
      
      if (javascriptModuleName.indexOf(".") === 0) {
        javascriptModuleName = path.resolve(javascriptModuleName);
      }
      
      log.debug("Requiring JS variant module: ", javascriptModuleName);
      var javascriptModule = require(javascriptModuleName);
      delete require.cache[require.resolve(javascriptModuleName)];
      
      log.debug("Getting JS variant handler factory function: ", variant.function || "default");
      var handlerFactory = javascriptModule[variant.function] || javascriptModule;
      
      log.debug("Invoking JS variant handler factory function");
      var handler = handlerFactory(variant, realm);
      
      log.debug("Invoking JS variant handler");
      res.serveVariant = serveTemplateDataVariant;
      handler(req, res, next);
    }

    function serveVariant(variant) {
      if (variant.template) return serveTemplateDataVariant(variant);
      if (variant.jsmodule) return serveJavaScriptVariant(variant);
      serveRealmIndex();
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
