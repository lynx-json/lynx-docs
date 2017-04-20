const types = require("../../types");
const specKey = /spec\.(.*)/;

function lynxPartial(parameters) {
  let result = { spec: {}, value: { "*~": null } };

  if (types.isObject(parameters)) {
    if (Object.keys(parameters).includes("value")) {
      result.value = parameters.value;
      delete parameters.value;
    }
    if (Object.keys(parameters).includes("spec")) {
      result.spec = parameters.spec;
      delete parameters.spec;
    } else {
      Object.keys(parameters).forEach(key => {
        let match = specKey.exec(key);
        if (!match) return;
        result.spec[match[1]] = parameters[key];
        delete parameters[key];
      });
    }
  } else {
    if (types.isArray(parameters)) result.spec.hints = ["container"];
    else result.spec.hints = ["text"];
    result.value = parameters;
  }
  return result;
}

module.exports = exports = lynxPartial;
