"use strict";

const lynxDocs = require("../index");
const path = require("path");
const types = require("../types");
const log = require("logatim");

function handleOptions(options) {
  processConfig(options.config);
  normalizeRoot(options);
  normalizeSpecHandling(options);
  normalizeLogging(options);

  log.blue.debug("Options\n=======");
  log.debug(JSON.stringify(options, null, 2));
}

function normalizeLogging(options) {
  if (!options.log && process.env.LOG_LEVEL) options.log = process.env.LOG_LEVEL;
  if (!types.isString(options.log)) options.log = "error";
  log.setLevel(options.log);
}

function normalizeSpecHandling(options) {
  if (!options.spec) return;

  if (options.spec === true) options.spec = {};
  if (!options.spec.dir) options.spec.dir = ".";
  if (!options.spec.url) options.spec.url = "/";
}

function processConfig(config) {
  if (config) {
    var configPath = path.resolve(process.cwd(), config);
    require(configPath)(lynxDocs);
  } else {
    require("../config")(lynxDocs);
  }
}

function normalizeRoot(options) {
  var roots = options._.slice(1); //look for variadic arguments as roots
  if (roots.length === 0) {
    roots = types.isArray(options.root) ? options.root : [options.root];
  }

  options.root = options.r = roots;
}

module.exports = exports = handleOptions;
