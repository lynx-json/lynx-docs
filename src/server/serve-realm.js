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
  return function (req, res, next) {
    
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
      serveVariantIndexForRealms([realm]);
    }
    
    function reduceToResults(accumulator, currentRealm) {
      accumulator.push({
        icon: "/meta/icons/meta.svg",
        title: currentRealm.title || "Untitled",
        url: currentRealm.metaURL,
        details: [ `realm: ${currentRealm.realm}` ]
      });
      
      currentRealm.variants.forEach(function (currentVariant) {
        accumulator.push({
          icon: "/meta/icons/app.svg",
          title: currentVariant.title || "Untitled",
          url: currentVariant.url
        });
      });
      
      return accumulator;
    }
    
    function serveVariantIndexForRealms(realms) {
      serveVariant({
        template: { ">.meta.variants": null },
        data: {
          realm: realms[0].realm,
          pageHeading: "Choose a Variant",
          resultsHeading: "",
          results: realms.reduce(reduceToResults, [])
        }
      });
    }
    
    var realm = req.realms.filter(r => url.parse(r.realm).pathname === url.parse(req.url).pathname);

    if (realm.length === 0) {
      if (req.url === "/" || req.url === "") return redirectToSearch(req, res, next);
      return next();
    }
    
    if (realm.length > 1) {
      return serveVariantIndexForRealms(realm);
    } else {
      realm = realm[0];
    }

    var template = req.query.template && realm.templates.find(t => t.path === req.query.template);
    if (template) {
      return serveTemplate(template);
    }

    var variantName = req.query.variant || "default";
    var variant = realm.variants.find(v => v.name === variantName || v.content !== undefined);

    if (variantName === "index" || !variant) {
      return serveVariantIndexForRealms([realm]);
    }

    if (variant.content) {
      req.filename = variant.content;
      return next();
    }

    return serveVariant(variant, realm.variants.length > 1);
  };
};
