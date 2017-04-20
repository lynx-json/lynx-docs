exports.partials = require("./partials");
exports.expandTokens = require("./expand-tokens").expand;
exports.toHandlebars = require("./to-handlebars");

exports.process = function (template, inferInverseTokenValues, templatePath) {
  var expanded = exports.expandTokens(template, inferInverseTokenValues);
  return exports.partials.expand(expanded, exports.partials.resolve, templatePath, inferInverseTokenValues);
};
