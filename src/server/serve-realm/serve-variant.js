const fs = require("fs");
const path = require("path");
const log = require("logatim");
const variantToLynx = require("../../lib/export/variants-to-lynx").one;

function createFile(path, content) {
  if (fs.existsSync(path)) return;
  fs.writeFileSync(path, content);
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

function serveTemplateDataVariant(options) {
  return function (variant, realm) {
    return function (req, res, next) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      var variantOptions = Object.assign({}, options, { realm: realm });

      res.write(variantToLynx(variant, variantOptions, createFile));
      res.end();
    };
  };
}

function serveJavaScriptVariant(options) {
  return function (variant, realm) {
    return function (req, res, next) {
      let paths = [realm.folder, process.cwd()];
      var javascriptModule = resolveJsModule(variant.jsmodule, paths);

      log.debug("Getting JS variant handler factory function: ", variant.function || "default");
      var handlerFactory = javascriptModule[variant.function] || javascriptModule;

      log.debug("Invoking JS variant handler factory function");
      var handler = handlerFactory(variant, realm);

      log.debug("Invoking JS variant handler");
      res.serveVariant = function (newVariant) {
        serveVariant(options)(newVariant, realm)(req, res, next);
      };
      handler(req, res, next);
    };
  };
}

function serveVariant(options) {
  let templateVariantHandler = serveTemplateDataVariant(options);
  let javascriptVariantHandler = serveJavaScriptVariant(options);
  let indexVariantHandler = serveVariantIndex(options);

  return function (variant, realm) {
    return function (req, res, next) {
      if (variant.template) return templateVariantHandler(variant, realm)(req, res, next);
      if (variant.jsmodule) return javascriptVariantHandler(variant, realm)(req, res, next);
      indexVariantHandler([realm])(req, res, next);
    };
  };
}

function serveVariantIndex(options) {
  let templateVariantHandler = serveTemplateDataVariant(options);

  return function (realms) {
    return function (req, res, next) {
      function reduceToResults(accumulator, currentRealm) {
        accumulator.push({
          icon: "/meta/icons/meta-here.svg",
          title: currentRealm.title || "Untitled",
          url: currentRealm.metaURL,
          details: [`realm: ${currentRealm.realm}`]
        });

        if (currentRealm.variants.length > 0) {
          accumulator.push({
            isHeader: true,
            label: "Variants"
          });
        }

        currentRealm.variants.forEach(function (currentVariant) {
          accumulator.push({
            icon: "/meta/icons/app.svg",
            title: currentVariant.title || "Untitled",
            url: currentVariant.url
          });
        });

        return accumulator;
      }

      let variant = {
        template: { ">.meta.variants": null },
        data: {
          realm: realms[0].realm,
          pageHeading: "Choose a Variant",
          resultsHeading: "",
          results: realms.reduce(reduceToResults, [])
        }
      };

      templateVariantHandler(variant, realms[0])(req, res, next);
    };
  };
}

module.exports = { variant: serveVariant, index: serveVariantIndex };
