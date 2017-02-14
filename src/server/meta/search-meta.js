const url = require("url");
const path = require("path");
const util = require("util");
const variantToLynx = require("../../lib/export/variants-to-lynx").one;
const searchUrlPattern = /\/meta\/search\/$/i;

module.exports = exports = function createSearchHandler(options) {
  function renderVariant(res, variant) {
    res.setHeader("Content-Type", "application/lynx+json");
    res.setHeader("Cache-control", "no-cache");

    var variantOptions = Object.assign({}, options, {
      realm: {
        realm: "http://lynx-json.org/docs/meta/search/",
        folder: path.resolve(options.root[0])
      }
    });

    res.write(variantToLynx(variant, variantOptions));
    res.end();
  }

  function renderRealms(res, realms) {
    var template = {
      ">.meta.realms": ""
    };

    var variant = {
      template: template,
      data: {
        realms: realms
      }
    };

    renderVariant(res, variant);
  }

  function renderRedirectToRealm(res, url) {
    var headers = {
      "Content-Type": "text/plain",
      "Location": url,
      "Cache-control": "no-cache"
    };
    res.writeHead(301, headers);
    res.end("Redirecting to realm " + url);
  }

  function buildRealmPredicate(term) {
    return function (realm) {
      return realm.realm.indexOf(term) !== -1;
    };
  }

  function buildTemplatePredicate(term) {
    return function (realm) {
      return realm.templates && realm.templates.some(t => t.path.indexOf(term) !== -1);
    };
  }

  function buildVariantPredicate(term) {
    return function (realm) {
      return realm.variants.some(v => {
        return(v.template && v.template.indexOf(term) !== -1) ||
          (v.data && v.data.indexOf(term) !== -1) ||
          (v.content && v.content.indexOf(term) !== -1);
      });
    };
  }

  function buildCustomPredicate(search) {
    return function (realm) {
      if(!(search.scope in realm)) return false;

      var value = realm[search.scope];
      if(!util.isString(value)) return false;

      return value.indexOf(search.term) !== -1;
    };
  }

  function parseTerm(term) {
    var parts = term.split(":");

    if(parts.length === 1) return { term: parts[0] };

    return {
      scope: parts[0],
      term: parts[1]
    };
  }

  var buildersByScope = {
    realm: buildRealmPredicate,
    template: buildTemplatePredicate,
    variant: buildVariantPredicate
  };

  function buildPredicateForTerm(term) {
    var search = parseTerm(term);

    if(search.scope) {
      if(search.scope in buildersByScope) return buildersByScope[search.scope](search.term);
      return buildCustomPredicate(search);
    } else {
      var predicates = [];

      for(var scope in buildersByScope) {
        if(!buildersByScope.hasOwnProperty(scope)) continue;
        predicates.push(buildersByScope[scope](search.term));
      }

      return function (realm) {
        return predicates.some(p => p(realm));
      };
    }
  }

  function buildPredicate(terms) {
    var predicates = terms.map(buildPredicateForTerm);
    return function (realm) {
      return predicates.every(p => p(realm));
    };
  }

  return function searchRealms(req, res, next) {
    if(!searchUrlPattern.test(req.pathname)) return next();

    if(!req.query || !req.query.q) return renderRealms(res, req.realms);

    var terms = req.query.q.split(/\s+/).filter(t => t !== "");
    if(terms.length === 0) return renderRealms(res, req.realms);

    var predicate = buildPredicate(terms);
    var realms = req.realms.filter(predicate);

    if(realms.length === 1) {
      return renderRedirectToRealm(res, realms[0].url);
    }

    return renderRealms(res, realms);
  };
};
