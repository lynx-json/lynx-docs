"use strict";
const types = require("../../../../types");

function validateHints(hints) {
  if (!types.isArray(hints)) return ["'hints' must be an array"];
  return hints.length > 0 ? [] : ["'hints' must not be empty"];
}

module.exports = exports = validateHints;
