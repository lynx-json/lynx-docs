const types = require("../../types");
const specKey = /^spec\.(.*)$/;

function lynxPartial(parameters) {
  let result = { spec: {}, value: { "*~": null } };

  if (types.isObject(parameters)) {
    result.spec.hints = ["container"];
    if (Object.keys(parameters).includes("value")) { //value handling
      result.value = parameters.value;
      delete parameters.value;
    }
    if (Object.keys(parameters).includes("spec")) { //spec handling
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
  } else { //parameters are not an object (array, string, null, true, false, number)
    if (types.isArray(parameters)) result.spec.hints = ["container"];
    else result.spec.hints = ["text"];
    result.value = parameters;
  }
  return result;
}

module.exports = exports = lynxPartial;