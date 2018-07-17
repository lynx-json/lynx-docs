exports.partials = require("./partials");
exports.expandTokens = require("./expand-tokens").expand;
exports.toHandlebars = require("./to-handlebars");

exports.process = function (source, resolvePartialStartPath, options) {
  var expanded = exports.expandTokens(source);
  return exports.partials.expand(expanded, exports.partials.resolve, resolvePartialStartPath, options);
};
