const url = require("url");
const path = require("path");
const exportYaml = require("../cli/export");

function generateRealmOrVariantUrl(realmOrVariant) {
  // create an address for the realm or variant object
  if (realmOrVariant.type === "variant") {
    var realmUrl = generateRealmOrVariantUrl( realmOrVariant.parent );
    var variantUrl = url.parse(realmUrl).pathname + "?variant=" + encodeURIComponent(realmOrVariant.name);
    return variantUrl;
  }
  else {
    return url.parse(realmOrVariant.realm).pathname;
  }
}

function isRequestForRealmOrVariant(requestUrl, realmOrVariantUrl) {
  console.log("REALM URL", realmOrVariantUrl);
  return url.parse(requestUrl).pathname === url.parse(realmOrVariantUrl).pathname;
}

function realmOrVariantMatchesRequestUrl(requestUrl) {
  return function (realmOrVariant) {
    var realmOrVariantUrl = generateRealmOrVariantUrl(realmOrVariant);
    return isRequestForRealmOrVariant(requestUrl, realmOrVariantUrl);
  };
}

module.exports = exports = function createStaticHandler(options) {
  // try to find the static file or call next
  return function (req, res, next) {
    var metadata = req.realms.find(realmOrVariantMatchesRequestUrl(req.url));
    console.log("REQ URL", req.url);
    console.log("META", metadata);
    if (!metadata) return next();
    
    var variants = metadata.variants;
    var realms = metadata.realms;
    
    function serveRealmIndex() {
      res.setHeader("Content-Type", "application/lynx+json");
      
      var data = {};
      data.realm = metadata.realm;
      if (variants.length > 0) data.variants = variants;
      else data.realms = realms;
      
      exportYaml.handler({
        format: "lynx",
        input: path.join(__dirname, "realm-index.lynx.yml"),
        output: res,
        data: data
      });
    }
    
    var query = url.parse(req.url, true).query;
    var variantName = query.variant || metadata.getDefaultVariant() || "default";
    var variant = variants.find(v => v.name === variantName);
    
    if (query.variant && !variant) return next();
    
    if (!variant && (variants.length > 0 || realms.length > 0))  {
      return serveRealmIndex(req, res);
    }
    
    if (!variant) return next();
    
    res.setHeader("Content-Type", "application/lynx+json");
    
    exportYaml.handler({
      format: "lynx",
      input: variant.template,
      output: res,
      data: variant.data
    });
  };
};
