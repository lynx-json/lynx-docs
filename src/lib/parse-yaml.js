"use strict";

var YAML = require("js-yaml");

module.exports = exports = function parseYaml(buffer) {
  // js-yaml.safeLoad with empty buffer results in undefined. Use `{}` instead
  if (buffer.length === 0) return {};

  // The safeLoad -> safeDump -> safeLoad is necessary to ensure unique object instances
  // Note on options:
  // * json: true enforces compatibility with JSON.parse behavior,
  //   so duplicate keys in a mapping will override values
  // * noRefs: true prevents converting duplicate objects into references
  let result = YAML.safeLoad(buffer, { json: true });
  if (!result) return result; //no need to dump and reparse falsey values
  return YAML.safeLoad(YAML.safeDump(result, { noRefs: true }));
};
