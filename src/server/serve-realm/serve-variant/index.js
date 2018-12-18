const serveJavaScriptVariant = require('./javascript');
const serveLynxContent = require('./lynx-content');
const serveTemplateContent = require('./template-content');
const serveDataContent = require('./data-content');
const serveVariantIndex = require('./meta-index');

const lynxDocsContentKey = 'ld-content';

function serveVariant(options) {
  let variantHandler = function (variant, realm) {
    return function (req, res, next) {
      //NOTE: Always process dynamic variants first. They may result in a reentrant call and that is the call that we care about returning as template, data, or lynx content
      if (variant.jsmodule) return javascriptVariantHandler(variant, realm)(req, res, next);

      if (req.query && req.query[lynxDocsContentKey]) {
        if (req.query[lynxDocsContentKey] === 'template' && variant.template) return templateContentHandler(variant.template, realm)(req, res, next);
        if (req.query[lynxDocsContentKey] === 'data' && variant.data) return dataContentHandler(variant.data || {}, realm)(req, res, next);
      }

      if (variant.template) return lynxContentHandler(variant, realm)(req, res, next);
      indexVariantHandler([realm])(req, res, next);
    };
  };

  let lynxContentHandler = serveLynxContent(options);
  let javascriptVariantHandler = serveJavaScriptVariant(options, variantHandler);
  let templateContentHandler = serveTemplateContent(options);
  let dataContentHandler = serveDataContent(options);
  let indexVariantHandler = serveVariantIndex(options);

  return variantHandler;
}

module.exports = exports = serveVariant;
