const types = require("../../../../types");
const url = require("url");
const contentTypeParser = require("content-type-parser");
const empty = "";

function validateData(value, errors) {
  if ("href" in value) errors.push("'link' value with a 'data' property must not have an 'href' property");

  if (!("type" in value)) return errors.push("'link' value with a 'data' property must have a 'type' property");
  let parsed = contentTypeParser(value.type);
  if (!parsed) return errors.push("'type' must be a valid media type name");
  if (parsed.subtype.indexOf("json") < 0 && !types.isString(value.data)) errors.push("The value of 'data' must be a string if the 'type' is not application/json or a variant of application/json");
  if ("encoding" in value && !(value.encoding === "utf-8" || value.encoding === "base64")) errors.push("'encoding' must be either 'utf-8' or 'base64'");
}

function validateHref(value, errors) {
  try {
    let parsed = url.parse(value.href);
  } catch (err) {
    errors.push("'href' must be a valid URI");
  }
  if ("data" in value) errors.push("'link' value with an 'href' property must not have a 'data' property");
  if ("encoding" in value) errors.push("'link' value with an 'href' property must not have an 'encoding' property");
  if ("type" in value) {
    let parsed = contentTypeParser(value.type);
    if (!parsed) return errors.push("'type' must be a valid media type name");
  }
}

function validateLink(value) {
  if (types.isNull(value)) return [];
  if (!types.isObject(value)) return ["'link' value must be an object"];
  let errors = [];
  if (!("href" in value) && !("data" in value)) errors.push("'link' value must have an 'href' or 'data' property");
  if ("href" in value) validateHref(value, errors);
  if ("data" in value) validateData(value, errors);
  return errors;
}

module.exports = exports = validateLink;
