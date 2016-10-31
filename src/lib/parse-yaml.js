"use strict";

var YAML = require("yamljs");

module.exports = exports = function parseYaml(buffer) {
  // ensure unique object instances by stringifying first
  return YAML.parse( YAML.stringify( YAML.parse( buffer.toString() ) ) );
};
