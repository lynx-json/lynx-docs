"use strict";

const fs = require("fs");
const path = require("path");
const url = require("url");
const util = require("util");
const parseYaml = require("./parse-yaml");
const metaPattern = /^.*\.meta.yml$/;
const templatePattern = /^(.*)\.lynx\.yml$/;
const dataFolderPattern = /^(.*)\.data$/;
const dataFilePattern = /^(.*)\.data(\.(.*))?\.yml$/;

function createVariant(realm, name, templateFile, dataFile) {
  return {
    parent: realm,
    name: name,
    template: path.format(templateFile),
    data: dataFile,
    type: "variant"
  };
}

function deriveVariantsForTemplateFile(realm, templateFile, templateName, contents) {
  var templateVariants = [];
  //add data files for the template
  contents.forEach(function(item) {
    var result = dataFilePattern.exec(item);
    if (!result || result[1] !== templateName) return;
    var name = result[3] || templateName;
    templateVariants.push(createVariant(realm, name, templateFile, path.join(templateFile.dir, item)));
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
      templateVariants.push(createVariant(realm, name, templateFile, dataFilePath));
    });
  });
  //if there are no variants, then the template itself is the variant
  if (templateVariants.length === 0) templateVariants.push(createVariant(realm, templateName, templateFile));

  return templateVariants;
}

function getVariants(realm) {
  var variants = [];
  var contents = realm.path ? fs.readdirSync(realm.path) : []; //if no path then it's a 'virtual' realm
  contents.forEach(function(item) {
    var result = templatePattern.exec(item);
    if (!result) return;
    var templateFile = path.parse(path.join(realm.path, item));
    var templateVariants = deriveVariantsForTemplateFile(realm, templateFile, result[1], contents);
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
}

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
}

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
    if (!realm && !parent) realm = "/"; //not in metadata and no parent
    if (realm) {
      self.realm = url.resolve(parentRealm, realm);
      return;
    }

    //this case is realm folder with parent realm folder and no .meta.yml
    realm = path.relative(parent.path, self.path) + "/";
    self.realm = url.resolve(parentRealm, realm);
  }

  function applyMetadata() {
    var meta = self.meta;
    delete self.meta;

    if (!meta) return;
    for (var k in meta) {
      if (meta.hasOwnProperty(k) && !self.hasOwnProperty(k)) { self[k] = meta[k]; }
    }
  }

  self.parent = parent;
  if (util.isString(pathOrMeta)) {
    self.path = pathOrMeta;
    self.meta = getFolderMeta(self);
  } else {
    self.path = null;
    self.meta = pathOrMeta;
  }

  calculateRealmAndName();
  self.variants = getVariants(self);
  self.realms = getRealms(self);
  self.type = "realm";
  applyMetadata();
}

Realm.prototype.resolvePath = function(relative) {
  if (!this.path) return this.parent.resolvePath(relative);
  return path.join(this.path, relative);
};

Realm.prototype.getDefaultVariant = function() {
  if (this.variants.length === 1) return this.variants[0];
  var defaultName = this.default || "default";
  return this.variants.find(function(variant) {
    return variant.name === defaultName;
  });
};

Realm.prototype.find = function(predicate) {
  if (predicate(this)) return this;

  var result = this.variants.find(predicate);
  if (result) return result;

  result = this.realms.find(predicate);
  return result;
};

module.exports = exports = folderPath => {
  return new Realm(path.normalize(folderPath));
};
