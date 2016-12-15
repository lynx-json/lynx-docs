"use strict";

const url = require("url");
const chokidar = require("chokidar");
const getRealmMetadata = require("../lib/metadata-realm");
const titleCase = require("to-title-case");

function getPathSegments(realmURI) {
  return url.parse(realmURI).pathname.split("/").filter(segment => segment !== "");
}

function isChildOfRealm(parentRealm) {
  return function (otherRealm) {
    if(otherRealm.realm === parentRealm.realm) return false;
    if(otherRealm.realm.indexOf(parentRealm.realm) === -1) return false;
    return getPathSegments(otherRealm.realm).length -
      getPathSegments(parentRealm.realm).length === 1;
  };
}

function urlForVariant(realm, variant) {
  return realm.url + "?variant=" + encodeURIComponent(variant.name);
}

function reloadRealms(target, options) {
  if(options.log) console.log("Loading realm information.");
  var realms = getRealmMetadata(options.root);

  realms.forEach(realm => {
    realm.url = realm.url || url.parse(realm.realm).pathname;
    realm.metaURL = "/meta/?realm=" + realm.realm;
    realm.realms = realms.filter(isChildOfRealm(realm));
    realm.variants.forEach(variant => {
      variant.title = variant.title || titleCase(variant.name);
      variant.url = variant.url || urlForVariant(realm, variant);
    });
  });

  target.length = 0;
  Array.prototype.push.apply(target, realms);
}

function getRealms(options) {
  var realms = [];

  function onWatcherReady(watcher) {
    return function () {
      reloadRealms(realms, options);
      watcher.on("all", function (event, path) {
        if(options.log) console.log(event, path, "Reloading realm information.");
        reloadRealms(realms, options);
      });
    };
  }

  options.root.forEach(root => {
    let watcher = chokidar.watch(root);
    watcher.on("ready", onWatcherReady(watcher));
  });

  return realms;
}

module.exports = exports = getRealms;
