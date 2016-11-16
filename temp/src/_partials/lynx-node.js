"use strict";

const util = require("util");
const partials = require("./partials");
const params = partials.params;
const param = partials.param;

module.exports = exports = function lynxNodePartial(kvp) {
  var result = {
    key: kvp.key,
    value: {}
  };
  
  var reservedKeywords = [ "spec", "hints", "key", "value", "partial", 
    "required", "minLength", "maxLength", "validation", "pattern", "format",
    "min", "max", "step" ];
  
  var spec, specParam = param(kvp, "spec");
  if (specParam) {
    spec = result.value[specParam.src.key] = specParam.src.value;
  } else {
    spec = result.value.spec = {};
  }
  
  var hints, hintsParam = param(kvp, "hints");
  if (hintsParam) {
    hints = spec[hintsParam.src.key] = hintsParam.src.value;
  }
  
  var value, valueParam = param(kvp, "value");
  if (valueParam) {
    value = result.value[valueParam.src.key] = valueParam.src.value;
  } else {
    value = result.value.value = {};
  }
  
  if (value && !util.isObject(value) || util.isArray(value)) return result;
  
  for (let param of params(kvp)) {
    if (reservedKeywords.indexOf(param.key) === -1) {
      value[param.src.key] = param.src.value;
    }
  }
  
  return result;
};
