"use strict";
const types = require("../../../../types");
const url = require("url");
const contentTypeParser = require("content-type-parser");

function validateData(value, errors) {
  if ("src" in value) errors.push("'content' value with a 'data' property must not have an 'src' property");

  if (!("type" in value)) return errors.push("'content' value with a 'data' property must have a 'type' property");
  let parsed = contentTypeParser(value.type);
  if (!parsed) return errors.push("'type' must be a valid media type name");
  if (parsed.subtype.indexOf("json") < 0 && !types.isString(value.data)) errors.push("The value of 'data' must be a string if the 'type' is not application/json or a variant of application/json");
  if ("encoding" in value && !(value.encoding === "utf-8" || value.encoding === "base64")) errors.push("'encoding' must be either 'utf-8' or 'base64'");
}

function validateSrc(value, errors) {
  try {
    let parsed = value.src !== null && url.parse(value.src);
  } catch (err) {
    errors.push("'src' must be a valid URI or null");
  }
  if ("data" in value) errors.push("'content' value with an 'src' property must not have a 'data' property");
  if ("encoding" in value) errors.push("'content' value with an 'src' property must not have an 'encoding' property");
}

function validateContent(value) {
  if (types.isNull(value)) return [];
  if (!types.isObject(value)) return ["'content' value must be an object"];
  let errors = [];
  if ("src" in value) validateSrc(value, errors);
  if ("data" in value) validateData(value, errors);
  return errors;
}

module.exports = exports = validateContent;
