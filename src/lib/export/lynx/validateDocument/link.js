const types = require("../../../../types");
const url = require("url");
const contentTypeParser = require("content-type-parser");

function validateData(value, errors) {
  if (value.href) errors.push("'link' value with a 'data' property must not have an 'href' property");

  if (!value.type) return errors.push("'link' value with a 'data' property must have a 'type' property");
  let parsed = contentTypeParser(value.type);
  if (!parsed) return errors.push("'type' must be a valid media type name");
  if (parsed.subtype.indexOf("json") < 0 && !types.isString(value.data)) errors.push("The value of 'data' must be a string if the 'type' is not application/json or a variant of application/json");
  if (value.encoding && !(value.encoding === "utf-8" || value.encoding === "base64")) errors.push("'encoding' must be either 'utf-8' or 'base64'");
}

function validateHref(value, errors) {
  try {
    let parsed = url.parse(value.href);
    if (!parsed || parsed.href.length === 0) errors.push("'href' must be a valid URI");
  } catch (err) {
    errors.push("'href' must be a valid URI");
  }
  if (value.data) errors.push("'link' value with an 'href' property must not have a 'data' property");
  if (value.encoding) errors.push("'link' value with an 'href' property must not have an 'encoding' property");
  if (value.type) {
    let parsed = contentTypeParser(value.type);
    if (!parsed) return errors.push("'type' must be a valid media type name");
  }
}

function validateLink(value) {
  if (types.isNull(value)) return [];
  if (!types.isObject(value)) return ["'link' value must be an object"];
  let errors = [];
  if (!value.href && !value.data) errors.push("'link' value must have an 'href' or 'data' property");
  if (value.href) validateHref(value, errors);
  if (value.data) validateData(value, errors);
  return errors;
}

module.exports = exports = validateLink;
