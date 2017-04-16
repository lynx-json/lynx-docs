const expandPartials = require("../json-templates/partials/expand");
const resolvePartials = require("../json-templates/partials/resolve");

module.exports = exports = (params) => {

  let partial = { ">container": {} };
  let partials = {};
  let raw = {};
  for (var p in params) {
    if (p === "realm") {
      raw["realmSection>section"] = { "header>": { "label>": p + " info" }, "content>text": params[p] };
    } else {
      try {
        let partialName = ".meta.realm." + p;
        let metaPartialUrl = expandPartials.calculatePartialUrl(__dirname, partialName);
        resolvePartials.resolve(metaPartialUrl);
        partials[p + ">" + partialName] = params[p];
      } catch (err) {
        raw[p + ">container"] = { "header>": { "label>": p + " info" }, "content>text": params[p] };
      }
    }
    delete params[p];
  }

  Object.assign(partial[">container"], partials, raw);
  return partial;
};
