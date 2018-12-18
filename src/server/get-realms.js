"use strict";

const url = require("url");
const chokidar = require("chokidar");
const getRealmMetadata = require("../lib/metadata-realm");
const titleCase = require("to-title-case");
const log = require("logatim");

function notifyMatchingRealms(matches) {
  let result = matches.reduce((acc, realm) => {
    acc.folders.push(realm.folder);
    realm.variants.forEach(v => {
      if (v.name in acc.variants) acc.variants[v.name] += 1;
      else acc.variants[v.name] = 1;
    });
    return acc;
  }, { folders: [], variants: {} });

  log.yellow(`Multiple folders detected with realm URI '${matches[0].url}' at paths\n\t'${result.folders.join("'\n\t'")}'`).warn();

  Object.keys(result.variants).forEach(key => {
    if (result.variants[key] > 1) log.red(`\tMultiple variants (${result.variants[key]}) found with name '${key}'`).error();
  });
}

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
  if (variant.template && !variant.title) {
    variant.title = titleCase(variant.name);
  } else {
    variant.title = variant.title || variant.name;
  }

  if (!variant.url) variant.url = realm.url + "?variant=" + encodeURIComponent(variant.name);
  if (variant.template && variant.data && !variant.handlebarsUrl) variant.handlebarsUrl = variant.url + "&format=handlebars";
}

function expandTemplate(realm, template) {
  if (!template.url) template.url = realm.url + "?template=" + encodeURIComponent(template.name);
}

function reloadRealms(target, options) {
  log.blue("Loading realm information.").info();
  var realms = getRealmMetadata(options.root);

  realms.forEach(realm => {
    realm.url = realm.url || url.parse(realm.realm).pathname;
    realm.metaURL = "/meta/realm/?uri=" + realm.realm;
    realm.variants.forEach(variant => expandVariant(realm, variant));
    realm.templates.forEach(template => expandTemplate(realm, template));
    realm.realms = realms.filter(isChildOfRealm(realm));
    realm.realms.forEach(child => child.parent = realm);
    let matches = realms.filter(check => check.url === realm.url);
    if (matches.length > 1) notifyMatchingRealms(matches);
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
        log.blue(event + " to " + path + "\nReloading realm information.").info();
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
