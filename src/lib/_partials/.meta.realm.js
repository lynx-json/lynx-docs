const expandPartials = require("../json-templates/partials/expand");
const resolvePartials = require("../json-templates/partials/resolve");

module.exports = exports = (params) => {

  function createMetaContent(name) {
    return { "header>": { "label>": "\"" + name + "\" info" }, "content>text": params[name] };
  }

  let partial = { ">container": {} };
  let partials = {};
  let raw = {};
  for (var p in params) {
    if (p === "realm") {
      raw["realmSection>section"] = createMetaContent(p);
    } else {
      try {
        let partialName = ".meta.realm." + p;
        let metaPartialUrl = expandPartials.calculatePartialUrl(__dirname, partialName);
        resolvePartials.resolve(metaPartialUrl);
        partials[p + ">" + partialName] = params[p];
      } catch (err) {
        raw[p + ">container"] = createMetaContent(p);
      }
    }
    delete params[p];
  }

  Object.assign(partial[">container"], partials, raw);
  return partial;
};
