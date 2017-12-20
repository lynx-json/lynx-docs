const metaUtil = require("./meta-util");
const realmDetailKeys = metaUtil.realmDetailKeys;
const variantDetailKeys = metaUtil.variantDetailKeys;
const getObjectDetails = metaUtil.getObjectDetails;

function noTermsFilter() {
  return false;
}

function reduceRealmsToVariants(accumulator, currentRealm) {
  if (!currentRealm.variants) return accumulator;
  
  var realm = {};
  
  Object.getOwnPropertyNames(currentRealm).forEach(function (p) {
    if (typeof currentRealm[p] !== "string") return;
    realm[p] = currentRealm[p];
  });
  
  currentRealm.variants.forEach(function (currentVariant) {
    var variant = Object.assign({}, realm, currentVariant);
    accumulator.push(variant);
  });
  
  return accumulator;
}

var noTermsQueryPlan = {
  filter: noTermsFilter,
  map: mapRealmToSearchResult
};

function areKindVariant(term) {
  return "kind" === term.scope && "variant" === term.value;
}

function objectMatches(obj, term) {
  if (typeof obj !== "object") return false;
  
  if (term.scope) {
    if (term.scope in obj === false) return !term.shouldMatch;
    if (typeof obj[term.scope] !== "string") return !term.shouldMatch;
    return obj[term.scope].toLowerCase().indexOf(term.value.toLowerCase()) > -1 === term.shouldMatch;
  } else {
    return Object.getOwnPropertyNames(obj).some(function (scope) {
      return objectMatches(obj, scoped(term, scope));
    });
  }
}

function scoped(term, scope) {
  return {
    value: term.value,
    scope: scope,
    shouldMatch: term.shouldMatch
  };
}

function buildFilter(plan) {
  var terms = plan.terms.filter(function (term) {
    return term.scope !== "kind";
  });
  
  plan.filter = function (obj) {
    if (!obj) return false;
    return terms.every(function (term) {
      return objectMatches(obj, term);
    });
  };
}

function mapRealmToSearchResult(realm) {
  return {
    icon: "/meta/icons/meta.svg",
    title: realm.title || "Untitled",
    url: realm.metaURL,
    details: getObjectDetails(realm, realmDetailKeys)
  };
}

function mapVariantToSearchResult(variant) {
  return {
    icon: "/meta/icons/app.svg",
    title: variant.title || "Untitled",
    url: variant.url,
    details: getObjectDetails(variant, variantDetailKeys)
  };
}

function getPart(part) {
  if (part.indexOf("-") === 0 || part.indexOf("+") === 0) return part.substr(1);
  return part;
}

function getExpectation(part) {
  if (part.indexOf("-") === 0) return false;
  return true;
}

function parse(userQuery) {
  userQuery = userQuery || "";
  
  var terms = userQuery.split(" ").map(function (term) {
    var parts = term.split(":");
    if (parts.length === 1) return { value: getPart(parts[0]), shouldMatch: getExpectation(parts[0]) };
    if (parts.length === 2) return { value: parts[1], scope: getPart(parts[0]), shouldMatch: getExpectation(parts[0]) };
  }).filter(function (term) {
    return term && term.value;
  });
  
  if (terms.length === 0) return noTermsQueryPlan;
  
  var plan = {
    terms: terms
  };
  
  if (plan.terms.some(areKindVariant)) {
    plan.variants = true;
    plan.reduce = reduceRealmsToVariants;
    plan.map = mapVariantToSearchResult;
  } else {
    plan.map = mapRealmToSearchResult;
  }
  
  buildFilter(plan);
  
  return plan;
}

exports.find = function (query, realms) {
  var plan = parse(query);
  
  var results = realms;
  
  if (plan.reduce) {
    results = results.reduce(plan.reduce, []);
  }
  
  return results.filter(plan.filter).map(plan.map);
};
