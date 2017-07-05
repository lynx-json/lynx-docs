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
      var variantOptions = Object.assign({}, options, { realm: metaRealm, spec: undefined });

      res.write(variantToLynx(variant, variantOptions));
      res.end();
    }

    function convertRealmForTemplate() { //need this to break circular references
      function getRealmData(realm) {
        let keep = ["realm", "url", "metaURL"];
        let result = {};
        keep.forEach(key => result[key] = realm[key]);
        return result;
      }

      let result = Object.assign({}, realm);
      if (realm.parent) result.parent = getRealmData(realm.parent);
      if (realm.realms) result.realms = realm.realms.map(getRealmData);
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
