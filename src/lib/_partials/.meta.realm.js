const partials = require("../partials-yaml");

module.exports = exports = (kvp, options) => {
  var result = {};
  options.partials = {
    contextFolder: kvp.value.folder
  };
  
  for (var p in kvp.value) {
    if (p === "key" || p === "value" || p === "partial") continue;
    
    var childKVP = { key: p + ">.meta.realm." + p, value: kvp.value[p] };
    var partialKVP = partials.getPartial(childKVP, options);
    if (partialKVP) {
      result[partialKVP.key] = partialKVP.value;
    } else {
      result[p] = childKVP.value;
    }
  }
  
  return {
    key: kvp.key + ">main",
    value: result
  };
};
