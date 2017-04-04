const partials = require("../partials-yaml");
const ignores = ["value", "key", "partial"];
module.exports = exports = (params, options) => {
  options = Object.assign({}, options, { contextFolder: params.folder });

  var partial = {};
  var raw = {};
  for (var p in params) {
    if (ignores.some(i => i === p)) continue;
    if (p === "realm") {
      raw.realmSection = { header: p, content: params[p] };
      continue;
    }

    var childKVP = { key: p + ">.meta.realm." + p, value: params[p] };
    var partialKVP = partials.getPartial(childKVP, options);
    if (!partialKVP) raw[p] = { header: p, content: params[p] };
    else partial[p] = partialKVP.value;
  }

  return Object.assign(partial, raw);
};
