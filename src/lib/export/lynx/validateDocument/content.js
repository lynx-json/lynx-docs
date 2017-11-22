const types = require("../../../../types");
const url = require("url");
const contentTypeParser = require("content-type-parser");

function validateData(value, errors) {
  if (value.src) errors.push("'content' value with an 'data' property must not have an 'src' property");

  if (!value.data.type) return errors.push("'content' value with a 'data' property must have a 'type' property");
  let parsed = contentTypeParser(value.data.type);
  if (!parsed) return errors.push("'type' must be a valid media type name");
  if (parsed.subtype.indexOf("json") >= 0 && !types.isString(value.data)) errors.push("The value of 'data' must be a string if the 'type' is not application/json or a variant of application/json");
  if (value.data.encoding && !(value.data.encoding === "utf-8" || value.data.encoding === "base64")) errors.push("'encoding' must be either 'utf-8' or 'base64'");
}

function validateSrc(value, errors) {
  try {
    let parsed = url.parse(value.src);
    if (!parsed || parsed.href.length === 0) errors.push("'src' must be a valid URI");
  } catch (err) {
    errors.push("'src' must be a valid URI");
  }
  if (value.data) errors.push("'content' value with an 'src' property must not have a 'data' property");
  if (value.encoding) errors.push("'content' value with an 'src' property must not have an 'encoding' property");
}

function validateContent(value) {
  if (types.isNull(value)) return [];
  if (!types.isObject(value)) return ["'content' value must be an object"];
  let errors = [];
  if (!value.src && !value.data) errors.push("'content' value must have an 'src' or 'data' property");
  if (value.src) validateSrc(value, errors);
  if (value.data) validateData(value, errors);
  return errors;
}

module.exports = exports = validateContent;
