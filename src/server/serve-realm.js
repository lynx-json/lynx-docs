"use strict";

const fs = require("fs");
const url = require("url");
const path = require("path");
const exportYaml = require("../lib/export-vinyl");

exportYaml.handler = function(options) {
  function onData(data) {
    options.output.write(data);
  }

  var buffer = fs.readFileSync(options.input);
  exportYaml.exportBuffer(buffer, onData, options);
  options.output.end();
};

function generateRealmOrVariantUrl(realmOrVariant) {
  // create an address for the realm or variant object
  if (realmOrVariant.type === "variant") {
    var realmUrl = generateRealmOrVariantUrl(realmOrVariant.parent);
    var variantUrl = url.parse(realmUrl).pathname + "?variant=" + encodeURIComponent(realmOrVariant.name);
    return variantUrl;
  } else {
    return url.parse(realmOrVariant.realm).pathname;
  }
}

function isRequestForRealmOrVariant(requestUrl, realmOrVariantUrl) {
  return url.parse(requestUrl).pathname === url.parse(realmOrVariantUrl).pathname;
}

function realmOrVariantMatchesRequestUrl(requestUrl) {
  return function(realmOrVariant) {
    var realmOrVariantUrl = generateRealmOrVariantUrl(realmOrVariant);
    return isRequestForRealmOrVariant(requestUrl, realmOrVariantUrl);
  };
}

function findRealmOrVariantMetadata(req) {
  for (let i = 0; i < req.realms.length; i++) {
    let match = req.realms[i].find(realmOrVariantMatchesRequestUrl(req.url));
    if (match) return match;
  }
}

function redirectToRealmIndex(req, res, next) {
  var realm = req.realms[0];
  if(!realm) return next();

  var location = url.parse(realm.realm);

  var headers = { "Content-Type": "text/plain", "Location": location.pathname, "Cache-control": "no-cache" };
  res.writeHead(301, headers);
  res.end("Redirecting to realm index");
}

module.exports = exports = function createStaticHandler(options) {
  // try to find the static file or call next
  return function(req, res, next) {

    var realmOrVariantMetadata = findRealmOrVariantMetadata(req);
    if (!realmOrVariantMetadata) {
      if(req.url === "/" || req.url === "") return redirectToRealmIndex(req, res, next);
      return next();
    }

    var variants = realmOrVariantMetadata.variants;

    function serveRealmIndex() {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");

      var data = {};
      data.realm = realmOrVariantMetadata.realm;
      data.variants = variants;
      
      data.variants.forEach(variant => {
        variant.url = generateRealmOrVariantUrl(variant);
      });
      
      exportYaml.handler({
        format: "lynx",
        input: path.join(__dirname, "realm-index.lynx.yml"),
        output: res,
        data: data,
        realm: data.realm
      });
    }

    var query = url.parse(req.url, true).query;
    var variant = query.variant ? variants.find(v => v.name === query.variant) : realmOrVariantMetadata.getDefaultVariant();

    if (query.variant && !variant) return next();

    if (!variant && (variants.length > 0 || realms.length > 0)) {
      return serveRealmIndex(req, res);
    }

    if (!variant || variant.content) {
      if (variant && variant.content) req.filename = variant.content;
      return next();
    }

    res.setHeader("Content-Type", "application/lynx+json");
    res.setHeader("Cache-control", "no-cache");

    exportYaml.handler({
      format: "lynx",
      input: variant.template,
      output: res,
      data: variant.data,
      realm: variant.realm || variant.parent.realm
    });
  };
};
