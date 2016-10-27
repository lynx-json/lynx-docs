"use strict";

const fs = require("fs");
const path = require("path");
const metaPattern = /^.*\.meta.yml$/;
const templatePattern = /^(.*)\.lynx\.yml$/;
const dataFolderPattern = /^(.*)\.data$/;
const dataFilePattern = /^(.*)\.data(\.(.*))?\.yml$/;

module.exports = exports = folderPath => {

  function createVariant(name, templateFile, dataFile) {
    return {
      name: name,
      template: templateFile,
      data: dataFile
    };
  }

  function deriveVariantsForTemplateFile(templateFile, templateName, contents) {
      var templateVariants = [];
      //add data files for the template
      contents.forEach(function(item){
        var result = dataFilePattern.exec(item);
        if(!result || !result[1] === templateName) return;
        var name = result[3] || templateName;
        templateVariants.push(createVariant(name, templateFile.base, item));
      });
      //add files from data folders for the template
      contents.forEach(function(item){
        var result = dataFolderPattern.exec(item);
        if(!result || result[1] !== templateName) return;

        fs.readdirSync(path.resolve(templateFile.dir, item)).forEach(function(data){
          var dataFilePath = path.join(item, data);
          var dataName = path.parse(data).name;
          var name = templateName === dataName ? dataName: templateName + "-" + dataName;
          templateVariants.push(createVariant(name, templateFile.base, dataFilePath));
        });
      });
      //if there are no data files, then the template itself is the variant
      if(templateVariants.length === 0) templateVariants.push(createVariant(templateName, templateFile.base));

      return templateVariants;
  }

  function deriveFromFileSystem(folder){
    var contents = fs.readdirSync(folder);

    var realm = { name: folder, realms: [], variants: [] };

    realm.realms = contents.filter(function(item){
      var stats = fs.statSync(path.resolve(folder, item));
      return stats.isDirectory() && !dataFolderPattern.test(item);
    });

    contents.forEach(function(item) {
      var result = templatePattern.exec(item);
      if(!result) return;
      var templateFile = path.parse(path.join(folder, item));
      var templateVariants = deriveVariantsForTemplateFile(templateFile, result[1], contents);
      Array.prototype.push.apply(realm.variants, templateVariants);
    });

    return realm;
  }

  function getRealm(folder) {

    var realm = deriveFromFileSystem(folder);
    return realm;
  }

  return getRealm(folderPath);
};
