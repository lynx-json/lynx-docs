const path = require("path");
const variantToLynx = require("../../lib/export/variants-to-lynx").one;
const url = require("url");

module.exports = exports = function createMetaHandler(options) {
  return function (req, res, next) {
    if (req.pathname !== "/meta/") return next();

    var realm = req.realms.find(r => r.realm === req.query.realm);
    // var metaRealm = req.realms.find(r => url.parse(r.realm).pathname === url.parse(req.url).pathname);

    if (!realm) return next();

    function serveVariant(variant) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      var metaRealm = Object.assign({}, realm, { realm: "http://lynx-json.org/docs/meta/" });
      var variantOptions = Object.assign({}, options, { realm: metaRealm });

      res.write(variantToLynx(variant, variantOptions));
      res.end();
    }

    function convertRealmForTemplate() { //need this to break circular references
      let parentKeysToKeep = ["realm", "url", "metaURL"];
      let result = {};
      Object.keys(realm).forEach(key => {
        if (key === "parent") { //break circular references
          result.parent = {};
          parentKeysToKeep.forEach(parentKey => {
            result.parent[parentKey] = realm.parent[parentKey];
          });
        } else {
          result[key] = realm[key];
        }
      });
      return result;
    }

    let template = { ">.meta.realm": convertRealmForTemplate() };

    var variant = {
      template: template,
      data: realm
    };
    serveVariant(variant);
  };
};
