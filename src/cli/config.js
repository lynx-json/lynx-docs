"use strict";

const types = require("../types");
const path = require("path");

function processCustomConfiguration(options, lynxDocs) {
  if (!types.isString(options.config) && !types.isArray(options.config)) return;

  let configurations = types.isString(options.config) ? [options.config] : options.config;

  configurations.forEach(config => {
    if (config.indexOf(".") === 0) config = path.resolve(process.cwd(), config);
    try {
      require(config)(options, lynxDocs);
    } catch (err) {
      throw new Error(`Resolving configuration module: "${config}"\nResulted in error: "${err.message}"`);
    }
  });
}

module.exports = exports = processCustomConfiguration;
