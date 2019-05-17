"use strict";
exports.partials = require("./partials");
exports.expandTokens = require("./expand-tokens");
exports.toHandlebars = require("./to-handlebars");
exports.templateKeys = require("./template-key");
exports.validators = require("./validators");

exports.process = function (source, resolvePartialStartPath, options) {
  var template = exports.expandTokens.expand(source);
  return exports.partials.expanding.expand(template, exports.partials.resolving.resolve, resolvePartialStartPath, options);
};
