function linkPartial(parameters) {
  let result = { ">lynx": { "spec.hints": ["submit"], "*~": null } };
  let value = result[">lynx"];

  if (parameters.label) {
    value["spec.labeledBy"] = "label";
  }

  return result;
}

module.exports = exports = linkPartial;
