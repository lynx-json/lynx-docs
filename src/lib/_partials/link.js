const types = require("../../types");

function linkPartial(parameters) {
  let result = { ">lynx": { "spec.hints": ["link"], "*~": null } };
  let partial = result[">lynx"];

  if (types.isObject(parameters)) {
    if (parameters.label) partial["spec.labeledBy"] = "label";
    partial["type~"] = "application/lynx+json";
  }

  return result;
}

module.exports = exports = linkPartial;
