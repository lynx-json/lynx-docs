"use strict";

const fs = require("fs");
const path = require("path");
const url = require("url");
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
    contents.forEach(function(item){
      var result = dataFilePattern.exec(item);
      if(!result || result[1] !== templateName) return;
      var name = result[3] || templateName;
      templateVariants.push(createVariant(name, templateFile, path.join(templateFile.dir, item)));
    });
    //add files from data folders for the template
    contents.forEach(function(item){
      var result = dataFolderPattern.exec(item);
      if(!result || result[1] !== templateName) return;

      fs.readdirSync(path.join(templateFile.dir, item)).forEach(function(data){
        var dataFilePath = path.join(templateFile.dir, item, data);
        var dataName = path.parse(data).name;
        var name = dataName === "default" ? templateName : dataName;
        templateVariants.push(createVariant(name, templateFile, dataFilePath));
      });
    });
    //if there are no variants, then the template itself is the variant
    if(templateVariants.length === 0) templateVariants.push(createVariant(templateName, templateFile));

    return templateVariants;
}

function getVariantsForFolder(folderPath){
  var variants = [];
  var contents = fs.readdirSync(folderPath);
  contents.forEach(function(item) {
    var result = templatePattern.exec(item);
    if(!result) return;
    var templateFile = path.parse(path.join(folderPath, item));
    var templateVariants = deriveVariantsForTemplateFile(templateFile, result[1], contents);
    Array.prototype.push.apply(variants, templateVariants);
  });
  return variants;
};

function getFileSystemMeta(folderPath){
  var metaFile = fs.readdirSync(folderPath).find(function(item) { return metaPattern.test(item); });
  if(!metaFile) return null;

  return parseYaml(fs.readFileSync(path.join(folderPath, metaFile)));
}

function Realm(folderPath, baseRealm) {
  var self = this;

  function calculateRealmValue() {
    var value = meta && meta.realm;
    if(value) return url.resolve(baseRealm, value);

    var folder = path.parse(folderPath);
    var dir = folder.dir ? "/" + folder.dir + "/" : "/";
    value = dir + folder.base + "/";
    return url.resolve(baseRealm, value);
  }

  var meta = getFileSystemMeta(folderPath);
  self.realm = calculateRealmValue();
  var variants = getVariantsForFolder(folderPath);

  self.getRealms = function getRealms(){
    return fs.readdirSync(folderPath).filter(function(item){
      var stats = fs.statSync(path.join(folderPath, item));
      return stats.isDirectory() && !dataFolderPattern.test(item);
    })
    .map(function(item){
      return new Realm(path.join(folderPath, item), self.realm);
    });
  };

  self.getVariants = function getVariants(){
    return variants;
  }
}

module.exports = exports = folderPath => {
  return new Realm(folderPath);
};
