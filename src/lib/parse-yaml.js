"use strict";

var YAML = require("js-yaml");

module.exports = exports = function parseYaml(buffer) {
  // The safeLoad -> safeDump -> safeLoad is necessary to ensure unique object instances
  // Note on options:
  // * json: true enforces compatibility with JSON.parse behavior,
  //   so duplicate keys in a mapping will override values
  // * noRefs: true prevents converting duplicate objects into references
  return (
    YAML.safeLoad(
      YAML.safeDump(
        YAML.safeLoad(buffer, {
          json: true
        }),
        {
          noRefs: true
        }
      )
    )
  );
};
