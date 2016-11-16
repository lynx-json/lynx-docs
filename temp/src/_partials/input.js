"use strict";

const sectionPartial = require("./section");
const partials = require("./partials");
const params = partials.params;
const param = partials.param;

function addRequiredValidation(value, kvp) {
  var input = value.input;
  var requiredParam = param(kvp, "required");
  var requiredMessageParam = param(kvp, "requiredMessage");
  if (requiredParam || requiredMessageParam) {
    input.spec.validation = input.spec.validation || {};
    input.spec.validation.required = {
      invalid: "requiredMessage"
    };
    
    if (requiredMessageParam) {
      value[requiredMessageParam.src.key] = requiredMessageParam.src.value;
    } else {
      value["requiredMessage"] = "Required";
    }
  }
}

function addValidation(value, kvp, category, constraint) {
  var input = value.input;
  var constraintParam = param(kvp, constraint);
  var constraintMessageParam = param(kvp, constraint + "Message");
  var categoryValidationMessageParam = param(kvp, category + "Message");
  
  var invalidMessageKey;
  if (constraintMessageParam) {
    invalidMessageKey = constraintMessageParam.key;
  } else if (categoryValidationMessageParam) {
    invalidMessageKey = categoryValidationMessageParam.key;
  } else {
    invalidMessageKey = constraint + "Message<";
  }
  
  if (constraintParam) {
    input.spec.validation = input.spec.validation || {};
    let constraints = input.spec.validation[category] = input.spec.validation[category] || [];
    let constraint = {};
    constraint[constraintParam.src.key] = constraintParam.src.value;
    constraint.invalid = invalidMessageKey;
    constraints.push(constraint);
    
    if (constraintMessageParam) {
      value[constraintMessageParam.src.key] = constraintMessageParam.src.value;
    } else if (categoryValidationMessageParam && !value[categoryValidationMessageParam.src.key]) {
      value[categoryValidationMessageParam.src.key] = categoryValidationMessageParam.src.value;
    } else {
      value[invalidMessageKey] = "Invalid Format";
    }
  }
}

function addTextFormat(value, kvp) {
  var input = value.input;
  var formatParam = param(kvp, "format");
  
  if (formatParam) {
    input.spec.validation = input.spec.validation || {};
    let text = input.spec.validation.text = input.spec.validation.text || [];
    let format = {};
    format.format = formatParam.src.value;
    text.push(format);
  }
}

module.exports = exports = function (kvp) {
  var value = kvp.value["value#" + kvp.key] = {};
  
  var labelParam = param(kvp, "label");
  if (labelParam) {
    value[labelParam.src.key] = labelParam.src.value;
  }
  
  var input = value["input"] = {
    spec: {
      hints: [ "line", "text" ],
      input: kvp.key,
      labeledBy: "label"
    },
    "value<": ""
  };
  
  addRequiredValidation(value, kvp);
  addValidation(value, kvp, "text", "minLength");
  addValidation(value, kvp, "text", "maxLength");
  addValidation(value, kvp, "text", "pattern");
  addValidation(value, kvp, "number", "min");
  addValidation(value, kvp, "number", "max");
  addValidation(value, kvp, "number", "step");
  addTextFormat(value, kvp);
  
  return sectionPartial(kvp);
};
