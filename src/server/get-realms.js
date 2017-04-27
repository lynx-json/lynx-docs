"use strict";

const url = require("url");
const chokidar = require("chokidar");
const getRealmMetadata = require("../lib/metadata-realm");
const titleCase = require("to-title-case");
const log = require("logatim");

function getPathSegments(realmURI) {
  return url.parse(realmURI).pathname.split("/").filter(segment => segment !== "");
}

function isChildOfRealm(parentRealm) {
  return function (otherRealm) {
    if (otherRealm.realm === parentRealm.realm) return false;
    if (otherRealm.realm.indexOf(parentRealm.realm) === -1) return false;
    return getPathSegments(otherRealm.realm).length -
      getPathSegments(parentRealm.realm).length === 1;
  };
}

function expandVariant(realm, variant) {
  variant.title = variant.title || titleCase(variant.name);
  if (!variant.url) variant.url = realm.url + "?variant=" + encodeURIComponent(variant.name);
  if (!variant.handlebarsUrl) variant.handlebarsUrl = variant.url + "&format=handlebars";
}

function expandTemplate(realm, template) {
  var firstVariant = realm.variants.find(v => v.template === template);
  return {
    path: template,
    url: realm.url + "?template=" + encodeURIComponent(template)
  };
}

function reloadRealms(target, options) {
  log.blue.info("Loading realm information.");
  var realms = getRealmMetadata(options.root);

  realms.forEach(realm => {
    realm.url = realm.url || url.parse(realm.realm).pathname;
    realm.metaURL = "/meta/?realm=" + realm.realm;
    realm.variants.forEach(variant => expandVariant(realm, variant));
    realm.templates = realm.templates.map(template => expandTemplate(realm, template));
    realm.realms = realms.filter(isChildOfRealm(realm));
    realm.realms.forEach(child => child.parent = realm);
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
        log.blue.info(event, path, "Reloading realm information.");
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
