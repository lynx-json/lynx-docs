"use strict";
const path = require("path");
const variantToLynx = require("../../lib/export/variants-to-lynx").one;
const url = require("url");
const metaUtil = require("./meta-util");

module.exports = exports = function createMetaHandler(options) {
  return function (req, res, next) {
    function serveVariant(variant) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-Control", "no-cache");

      var metaRealm = Object.assign({}, firstRealm, { realm: "http://lynx-json.org/docs/meta/realm/" });
      var variantOptions = Object.assign({}, options, { realm: metaRealm, spec: undefined });

      res.write(variantToLynx(variant, variantOptions));
      res.end();
    }

    function collectResult(realm, results) {
      function mapRealm(r, icon) {
        return {
          icon: icon,
          title: r.title || "Untitled",
          urls: [{ label: r.title || 'Untitled', href: r.metaURL }],
          details: [
            `realm: ${r.realm}`,
            `folder: ${r.folder}`
          ]
        };
      }

      function createHeader(label) {
        return {
          isHeader: true,
          label: label
        };
      }

      results.push(mapRealm(realm, "/meta/icons/meta-here.svg"));

      if (realm.variants.length > 0) {
        results.push(createHeader("Variants"));
      }

      realm.variants.forEach(function (variant) {
        results.push(metaUtil.createVariantResult(variant));
      });

      // TODO: Review. This seems unnecessary since we've already added all variants.
      // results.push({
      //   icon: "/meta/icons/app.svg",
      //   title: "View All Variants",
      //   url: realm.url + "?variant=index"
      // });

      if (realm.parent) {
        results.push(createHeader("Parent"));
        results.push(metaUtil.createRealmResult(realm.parent, "/meta/icons/meta-up.svg"));
      }

      if (realm.realms && realm.realms.length > 0) {
        results.push(createHeader("Children"));
        realm.realms.forEach(function (child) {
          results.push(metaUtil.createRealmResult(child, "/meta/icons/meta-down.svg"));
        });
      }
    }

    if (req.pathname !== "/meta/realm/") return next();

    var realms = req.realms.filter(r => r.realm === encodeURI(req.query.uri));

    if (realms.length === 0) return next();

    var firstRealm = realms[0],
      realmTitle,
      pageHeading,
      resultsHeading,
      results = [];

    if (realms.length > 1) {
      var titles = realms.reduce(function (acc, cv) {
        if (!cv.title) return acc;
        if (acc.indexOf(cv.title) > -1) return acc;
        acc.push(cv.title);
      }, []);

      if (titles.length === 1) {
        realmTitle = titles[0];
      } else {
        realmTitle = realms[0].realm;
      }
    } else {
      realmTitle = realms[0].title || "Untitled";
    }

    pageHeading = `Details for Realm '${realmTitle}'`;

    realms.forEach(function (realm) {
      collectResult(realm, results);
    });

    var template = { ">.meta.realm": null };

    var variant = {
      template: template,
      data: {
        pageHeading: pageHeading,
        description: null,
        resultsHeading: resultsHeading,
        results: results
      }
    };

    serveVariant(variant);
  };
};
