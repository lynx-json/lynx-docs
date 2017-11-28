const traverse = require("traverse");
const types = require("../../../../types");
const log = require("logatim");
const lynxHelpers = require("../index");
const validators = {
  hints: require("./hints"),
  text: require("./text"),
  content: require("./content"),
  form: require("./form"),
  link: require('./link'),
  submit: require("./submit")
};

const lynxBaseHints = ["text", "container", "form", "link", "submit", "content"];

function createValidationError(key, jsValue, errors) {
  return { key: key, json: JSON.stringify(jsValue), errors: errors };
}

function validateLynxDocument(document, domainSpecificBaseHints) {
  let baseHints = lynxBaseHints.concat(domainSpecificBaseHints || []);
  let validationErrors = traverse(document).reduce(function (acc, jsValue) {
    if (lynxHelpers.isLynxValue(jsValue)) {
      let hints = jsValue.spec.hints;
      let errors = validators.hints(hints);
      let baseHint = baseHints.find(hint => hints[hints.length - 1] === hint);
      if (!baseHint) {
        errors.push("hints array must have a base hint as the last item");
        acc.push(createValidationError(this.key, jsValue, errors));
        return acc;
      }
      let validator = validators[baseHint];
      if (validator) errors = errors.concat(validator(lynxHelpers.getValuePortionOfLynxValue(jsValue)));
      if (errors.length > 0) acc.push(createValidationError(this.key, jsValue, errors));
    }
    return acc;
  }, []);

  return { valid: validationErrors.length === 0, errors: validationErrors };
}

module.exports = exports = validateLynxDocument;
