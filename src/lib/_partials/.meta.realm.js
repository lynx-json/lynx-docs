const partials = require("../partials-yaml");

module.exports = exports = (kvp, options) => {
  options.partials = {
    contextFolder: kvp.value.folder
  };

  var partial = {};
  var raw = {};
  for(var p in kvp.value) {
    if(p === "key" || p === "value" || p === "partial") continue;

    var childKVP = { key: p + ">.meta.realm." + p, value: kvp.value[p] };
    var partialKVP = partials.getPartial(childKVP, options);
    if(partialKVP) {
      partial[partialKVP.key] = partialKVP.value;
    } else {
      raw[p] = { header: p, content: childKVP.value };
    }
  }

  return {
    key: kvp.key + ">main",
    value: Object.assign(partial, raw)
  };
};
