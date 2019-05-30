"use strict";
const path = require('path');
const log = require('logatim');
const processDataOrFile = require('../../../lib/export/');

function resolveJsModule(name, paths) {
  log.debug('Requiring JS variant module: ', name);
  let names = [name];
  if (name.indexOf('.') === 0) {
    names = paths.map(p => path.resolve(p, name));
  }

  let accumulator = names.reduce((acc, current) => {
    if (acc.module) return acc;
    try {
      delete require.cache[require.resolve(current)];
      acc.module = require(current);
    } catch (err) {
      acc[current] = err.message;
    }
    return acc;
  }, {});

  if (accumulator.module) return accumulator.module;

  let messages = Object.keys(accumulator).reduce((acc, current) => {
    acc.push(`Resolving module: "${current}"\nResulted in error: "${accumulator[current]}"`);
    return acc;
  }, []);

  throw Error(`Unable to resolve jsmodule for variant.\n\n${messages.join("\n\n")}`);
}

function serveJavaScriptVariant(options, serveVariant) {
  return function (variant, realm) {
    return function (req, res, next) {
      res.serveVariant = function (newVariant) {
        serveVariant(newVariant, realm)(req, res, next);
      };

      res.processDataOrFile = function (dataOrFile) {
        return processDataOrFile(dataOrFile, options);
      };

      let paths = [realm.folder, process.cwd()];
      var javascriptModule = resolveJsModule(variant.jsmodule, paths);

      log.debug('Getting JS variant handler factory function: ', variant.function || 'default');
      var handlerFactory = javascriptModule[variant.function] || javascriptModule;

      log.debug('Invoking JS variant handler factory function');
      var handler = handlerFactory(variant, realm);

      log.debug('Invoking JS variant handler');
      handler(req, res, next);
    };
  };
}

module.exports = exports = serveJavaScriptVariant;
