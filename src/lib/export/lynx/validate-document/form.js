"use strict";
const types = require("../../../../types");

function validateForm(value) {
  let valid = (types.isNull(value) || types.isObject(value) || types.isArray(value));
  return valid ? [] : ["'form' value must be an object or array"];
}

module.exports = exports = validateForm;
