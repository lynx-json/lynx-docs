const types = require("../../../../types");

function validateText(value) {
  let valid = types.isString(value) || types.isNumber(value) || types.isBoolean(value) || types.isNull(value);
  return valid ? [] : ["'text' values must be a string, number, 'true', 'false', or 'null'"];
}

module.exports = exports = validateText;
