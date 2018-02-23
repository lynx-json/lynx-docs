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

function resolveJsModule(name, paths) {
  log.debug("Requiring JS variant module: ", name);
  let names = [name];
  if (name.indexOf(".") === 0) {
    names = paths.map(p => path.resolve(p, name));
  }

  let module = names.reduce((acc, current) => {
    if (acc) return acc;
    try {
      delete require.cache[require.resolve(current)];
      return require(current);
    } catch (err) { return null; }
  }, null);

  if (!module) throw `Unable to resolve jsmodule for variant. The following names were used: ['${names.join("' , '")}']`;

  return module;
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
<<<<<<< HEAD
      var javascriptModuleName = variant.jsmodule;

      if (javascriptModuleName.indexOf(".") === 0) {
        javascriptModuleName = path.resolve(javascriptModuleName);
      }

      log.debug("Requiring JS variant module: ", javascriptModuleName);
      var javascriptModule = require(javascriptModuleName);
      delete require.cache[require.resolve(javascriptModuleName)];
=======
      let paths = [realm.folder, process.cwd()];
      var javascriptModule = resolveJsModule(variant.jsmodule, paths);
>>>>>>> a00aef0ef41e62c52f120085de18be65f3c4b660

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
        icon: "/meta/icons/meta-here.svg",
        title: currentRealm.title || "Untitled",
        url: currentRealm.metaURL,
        details: [`realm: ${currentRealm.realm}`]
      });

<<<<<<< HEAD
      if (currentRealm.variants.length > 0) {
        accumulator.push({
          isHeader: true,
          label: "Variants"
        });
      }

=======
>>>>>>> a00aef0ef41e62c52f120085de18be65f3c4b660
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

    var realm, realms = req.realms.filter(r => url.parse(r.realm).pathname === url.parse(req.url).pathname);

    if (realms.length === 0) {
      if (req.url === "/" || req.url === "") return redirectToSearch(req, res, next);
      return next();
    }

    if (req.query.template) {
      var template = realms.reduce(function (acc, r) {
        if (acc) return acc;
        return r.templates.find(t => t.path === req.query.template);
      }, null);

      if (template) {
        return serveTemplate(template);
      }
    }

    if (realms.length > 1) {
      return serveVariantIndexForRealms(realms);
    } else {
      realm = realms[0];
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

    return serveVariant(variant);
  };
};
