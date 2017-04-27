const types = require("../../types");

function submitPartial(parameters) {
  let result = { ">lynx": { "spec.hints": ["submit"], "*~": null } };
  let partial = result[">lynx"];

  if (types.isObject(parameters) && parameters.label) partial["spec.labeledBy"] = "label";

  return result;
}

module.exports = exports = submitPartial;
