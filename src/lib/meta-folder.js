"use strict";

const fs = require("fs");
const path = require("path");
const url = require("url");
const urijs = require("urijs");
const util = require("util");
const parseYaml = require("./parse-yaml");
const metaPattern = /^.*\.meta.yml$/;
const templatePattern = /^(.*)\.lynx\.yml$/;
const dataFolderPattern = /^(.*)\.data$/;
const dataFilePattern = /^(.*)\.data(\.(.*))?\.yml$/;

function createVariant(name, templateFile, dataFile) {
  return {
    name: name,
    template: path.format(templateFile),
    data: dataFile
  };
}

function deriveVariantsForTemplateFile(templateFile, templateName, contents) {
  var templateVariants = [];
  //add data files for the template
  contents.forEach(function(item) {
    var result = dataFilePattern.exec(item);
    if (!result || result[1] !== templateName) return;
    var name = result[3] || templateName;
    templateVariants.push(createVariant(name, templateFile, path.join(templateFile.dir, item)));
  });
  //add files from data folders for the template
  contents.forEach(function(item) {
    var result = dataFolderPattern.exec(item);
    if (!result || result[1] !== templateName) return;

    console.log(path.join(templateFile.dir, item));

    fs.readdirSync(path.join(templateFile.dir, item)).forEach(function(data) {
      var dataFilePath = path.join(templateFile.dir, item, data);
      var dataName = path.parse(data).name;
      var name = dataName === "default" ? templateName : dataName;
      templateVariants.push(createVariant(name, templateFile, dataFilePath));
    });
  });
  //if there are no variants, then the template itself is the variant
  if (templateVariants.length === 0) templateVariants.push(createVariant(templateName, templateFile));

  return templateVariants;
}

function getVariants(realm) {
  var variants = [];
  var contents = realm.path ? fs.readdirSync(realm.path) : []; //if no path then it's a 'virtual' realm
  contents.forEach(function(item) {
    var result = templatePattern.exec(item);
    if (!result) return;
    var templateFile = path.parse(path.join(realm.path, item));
    var templateVariants = deriveVariantsForTemplateFile(templateFile, result[1], contents);
    Array.prototype.push.apply(variants, templateVariants);
  });
  if (realm.meta && realm.meta.variants) {
    realm.meta.variants.forEach(function(variant) {
      variant.template = realm.resolvePath(variant.template);
      if (variant.data) variant.data = realm.resolvePath(variant.data);
      var index = variants.findIndex(function(candidate) {
        return candidate.template === variant.template && candidate.data === variant.data;
      });
      if (index >= 0) variants.splice(index, 1, variant);
      else variants.push(variant);
    });
  }
  return variants;
};

function getRealms(realm) {
  var realms = realm.path ? fs.readdirSync(realm.path).filter(function(item) {
      var stats = fs.statSync(path.join(realm.path, item));
      return stats.isDirectory() && !dataFolderPattern.test(item);
    })
    .map(function(item) {
      return new Realm(path.join(realm.path, item), realm);
    }) : []; //if no path then it's a 'virtual' realm
  if (realm.meta && realm.meta.realms) {
    realm.meta.realms.forEach(function(child) {
      var newRealm = new Realm(child, realm);
      if (realms.find(function(existing) { return existing.realm === newRealm.realm; })) return; //realms from file system win
      realms.push(newRealm);
    });
  }
  return realms;
};

function getFolderMeta(realm) {
  var metaFile = fs.readdirSync(realm.path).find(function(item) { return metaPattern.test(item); });
  if (!metaFile) return null;

  return parseYaml(fs.readFileSync(path.join(realm.path, metaFile)));
}

function Realm(pathOrMeta, parent) {
  var self = this;

  function calculateRealmAndName() {
    var folder = self.path ? path.parse(self.path) : { base: "unknown" };
    self.name = self.meta && self.meta.name || folder.base;

    var parentRealm = parent && parent.realm || "/";
    var realm = self.meta && self.meta.realm;
    if (realm) return url.resolve(parentRealm, realm);

    var dir = folder.dir ? "/" + folder.dir + "/" : "/";
    realm = dir + folder.base + "/";
    return url.resolve(parentRealm, realm);
  }

  function applyMetadata() {
    if (!self.meta) return;

    for (var k in self.meta) {
      if (self.meta.hasOwnProperty(k) && !self.hasOwnProperty(k)) { self[k] = self.meta[k]; }
    }
    delete self.meta;
  }


  self.parent = parent;
  if (util.isString(pathOrMeta)) {
    self.path = pathOrMeta;
    self.meta = getFolderMeta(self);
  } else {
    self.path = null;
    self.meta = pathOrMeta;
  }

  self.realm = calculateRealmAndName();
  self.variants = getVariants(self);
  self.realms = getRealms(self);
  applyMetadata();
}

Realm.prototype.resolvePath = function(relative) {
  if (!this.path) return this.parent.resolvePath(relative);
  return path.join(this.path, relative);
}

Realm.prototype.getDefaultVariant = function() {
  if (this.variants.length === 1) return this.variants[0];
  var defaultName = this.default || "default";
  return this.variants.find(function(variant) {
    return variant.name === defaultName;
  });
}

Realm.prototype.find = function(realmUri) {
  var normalizedA = urijs(this.realm).normalize().toString();
  var normalizedB = urijs(realmUri).normalize().toString();
  if (normalizedA === normalizedB) return this;

  if (normalizedB.indexOf(normalizedA) !== 0) return null;

  for (var i = 0; i < this.realms.length; i++) {
    var match = this.realms[i].find(realmUri);
    if (match) return match;
  }

  return null;
}

module.exports = exports = folderPath => {
  return new Realm(folderPath);
};
