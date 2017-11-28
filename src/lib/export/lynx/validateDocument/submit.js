const types = require("../../../../types");
const url = require("url");
const contentTypeParser = require("content-type-parser");

function validateSend(value, errors) {
  if (value.send !== "change" && value.send !== "ready") errors.push("'send' must be either 'change' or 'ready'");
}

function validateType(value, errors) {
  let parsed = contentTypeParser(value.type);
  if (!parsed) return errors.push("'type' must be a valid media type name");
}

function validateAction(value, errors) {
  if (!value.action) errors.push("'submit' value must have an 'action'");
  try {
    let parsed = url.parse(value.action);
    if (!parsed || parsed.href.length === 0) errors.push("'action' must be a valid URI");
  } catch (err) {
    errors.push("'action' must be a valid URI");
  }
}

function validateSubmit(value) {
  if (types.isNull(value)) return [];
  if (value && !types.isObject(value)) return ["'submit' value must be an object"];
  let errors = [];
  validateAction(value, errors);
  if (value.type) validateType(value, errors);
  if (value.send) validateSend(value, errors);
  return errors;
}

module.exports = exports = validateSubmit;
