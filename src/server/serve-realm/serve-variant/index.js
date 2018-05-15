const serveJavaScriptVariant = require("./javascript");
const serveTemplateVariant = require("./template");
const serveVariantIndex = require("./meta-index");

function serveVariant(options) {
  let variantHandler = function (variant, realm) {
    return function (req, res, next) {
      if (variant.template) return templateVariantHandler(variant, realm)(req, res, next);
      if (variant.jsmodule) return javascriptVariantHandler(variant, realm)(req, res, next);
      indexVariantHandler([realm])(req, res, next);
    };
  };

  let templateVariantHandler = serveTemplateVariant(options);
  let javascriptVariantHandler = serveJavaScriptVariant(options, variantHandler);
  let indexVariantHandler = serveVariantIndex(options);

  return variantHandler;
}

module.exports = exports = serveVariant;
