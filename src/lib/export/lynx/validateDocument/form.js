const types = require("../../../../types");

function validateForm(value) {
  let valid = (types.isNull(value) || types.isObject(value))
  return valid ? [] : ["'form' must be an object"];
}

module.exports = exports = validateForm;
