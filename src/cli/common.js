"use strict";

const lynxDocs = require("../index");
const path = require("path");
const util = require("util");

function handleOptions(options) {
  processConfig(options.config);
  normalizeRoot(options);
}

function processConfig(config) {
  if(config) {
    var configPath = path.resolve(process.cwd(), config);
    require(configPath)(lynxDocs);
  } else {
    require("../config")(lynxDocs);
  }
}

function normalizeRoot(options) {
  var roots = options._.slice(1); //look for variadic arguments as roots
  if(roots.length === 0) {
    roots = util.isArray(options.root) ? options.root : [options.root];
  }

  options.root = options.r = roots;
}

module.exports = exports = handleOptions;
