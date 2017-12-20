const path = require("path");
const variantToLynx = require("../../lib/export/variants-to-lynx").one;
const url = require("url");
const metaUtil = require("./meta-util");

module.exports = exports = function createMetaHandler(options) {
  return function (req, res, next) {
    function serveVariant(variant) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      var metaRealm = Object.assign({}, realm, { realm: "http://lynx-json.org/docs/meta/realm/" });
      var variantOptions = Object.assign({}, options, { realm: metaRealm, spec: undefined });

      res.write(variantToLynx(variant, variantOptions));
      res.end();
    }

    function createResults(realm) {
      function mapRealm(r, icon) {
        return {
          icon: icon,
          title: r.title || "Untitled",
          url: r.metaURL,
          details: [ `realm: ${r.realm}` ]
        };
      }
      
      var result = [];
      
      realm.variants.forEach(function (variant) {
        result.push({
          icon: "/meta/icons/app.svg",
          title: variant.title || "Untitled",
          url: variant.url,
          details: metaUtil.getObjectDetails(variant, metaUtil.variantDetailKeys)
        });
      });
      
      result.push({
        icon: "/meta/icons/app.svg",
        title: "View All Variants",
        url: realm.url + "?variant=index"
      });
      
      if (realm.parent) {
        result.push(mapRealm(realm.parent, "/meta/icons/meta-up.svg"));
      }
      
      if (realm.realms) {
        realm.realms.forEach(function (child) {
          result.push(mapRealm(child, "/meta/icons/meta-down.svg"));
        });
      }
      
      return result;
    }
    
    if (req.pathname !== "/meta/realm/") return next();

    var realms = req.realms.filter(r => r.realm === req.query.uri);

    if (realms.length === 0) return next();
    
    var pageHeading, description, resultsHeading, results;
    
    if (realms.length > 1) {
      pageHeading = "Choose a Realm (Not Implemented Yet)";
      resultsHeading = "Realms";
      description = `Multiple realms were found with the same realm URI: '${realms[0].realm}'`;
      // TODO: handle a request for realm metadata when more than one 
      // realm of info shares the same realm URI
      results = [];
    } else {
      var realm = realms[0];
      var realmTitle = realm.title || "Untitled";
      pageHeading = `Details for Realm '${realmTitle}'`;
      results = createResults(realm);
    }

    let template = { ">.meta.realm": null };

    var variant = {
      template: template,
      data: {
        pageHeading: pageHeading,
        description: description,
        resultsHeading: resultsHeading,
        results: results
      }
    };
    
    serveVariant(variant);
  };
};
