const types = require("../../../../types");

function validateForm(value) {
  let valid = (types.isNull(value) || types.isObject(value));
  return valid ? [] : ["'form' value must be an object"];
}

module.exports = exports = validateForm;
