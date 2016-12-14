const path = require("path");
const variantToLynx = require("../lib/export/variants-to-lynx").one;
const url = require("url");

module.exports = exports = function createMetaHandler(options) {
  return function (req, res, next) {
    if(req.pathname !== "/meta/") return next();

    var realm = req.realms.find(r => r.realm === req.query.realm);
    // var metaRealm = req.realms.find(r => url.parse(r.realm).pathname === url.parse(req.url).pathname);

    if(!realm) return next();

    var descendants = req.realms.filter(candidate => {
      return candidate.realm.indexOf(realm.realm) === 0 &&
        candidate.realm.length > realm.realm.length;
    });

    function serveVariant(variant) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      var variantOptions = Object.assign({}, options, { realm: realm });

      res.write(variantToLynx(variant, variantOptions));
      res.end();
    }

    if(realm) {
      var variant = {
        template: path.join(__dirname, "meta/default.lynx.yml"),
        data: Object.assign({}, realm, { descendants: descendants })
      };
      serveVariant(variant);
    }

  };
}
