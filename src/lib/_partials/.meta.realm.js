const partials = require("../partials-yaml");
const ignores = ["value", "key", "partial"];
module.exports = exports = (kvp, options) => {
  options = Object.assign({}, options, { contextFolder: kvp.value.folder });

  var partial = {};
  var raw = {};
  for(var p in kvp.value) {
    if(ignores.some(i => i === p)) continue;
    if(p === "realm") {
      raw[p] = { header: p, content: kvp.value[p] };
      continue;
    }

    var childKVP = { key: p + ">.meta.realm." + p, value: kvp.value[p] };
    var partialKVP = partials.getPartial(childKVP, options);
    if(!partialKVP) raw[p] = { header: p, content: kvp.value[p] };
    else partial[partialKVP.key] = partialKVP.value;
  }

  return {
    key: kvp.key,
    value: Object.assign(partial, raw)
  };
};
