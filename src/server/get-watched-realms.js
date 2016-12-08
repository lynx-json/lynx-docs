"use strict";

const util = require("util");
const url = require("url");
const chokidar = require("chokidar");
const getRealmMetadata = require("../lib/metadata-realm");
const titleCase = require("to-title-case");

function getWatchedRealms(options) {
  var reload = true;
  var realms = [];

  options.root.forEach(root => chokidar
    .watch(root)
    .on("all", function (event, path) {
      reload = true;
      if(options.log && realms.length > 0) console.log(event, path, "Realm(s) will be reloaded with next request");
    }));

  return function getRealms() {
    if(reload) {
      if(options.log) console.log("Loading realm(s)", options.root);
      realms = loadRealms(options.root);
      reload = false;
    }
    return realms;
  };
}

function loadRealms(roots, realm) {
  var realms = getRealmMetadata(roots, realm);

  realms.forEach(realm => {
    realm.url = realm.url || url.parse(realm.realm).pathname;
    realm.variants.forEach(variant => {
      variant.title = variant.title || titleCase(variant.name);
      variant.url = variant.url || urlForVariant(realm, variant);
    });
  });

  return realms;
}

function urlForVariant(realm, variant) {
  return realm.url + "?variant=" + encodeURIComponent(variant.name);
}

module.exports = exports = getWatchedRealms;
