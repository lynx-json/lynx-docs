"use strict";

const fs = require("fs");
const path = require("path");
const templatePattern = /^.*\.yml$/;

function createState(name, template, data) {
  return {
    name: name,
    template: template,
    data: data
  };
}

module.exports = exports = folderPath => {
  var folderContents = fs.readdirSync(folderPath);

  function getVariants() {
    var variants = [];

    var templateStates = folderContents.filter(n => templatePattern.test(n))
      .map(n => createState(path.parse(n).name, path.join(folderPath, n)));

    templateStates.forEach(t => {
      var dataFolderPath = path.join(folderPath, t.name + ".data");
      if (fs.existsSync(dataFolderPath)) {
        let contents = fs.readdirSync(dataFolderPath);
        variants = variants.concat(contents.map(n => {
          var stateName = path.parse(n).name;
          if (stateName === "default") stateName = t.name;
          else if (t.name !== "default") stateName = t.name + "-" + stateName;

          return createState(stateName, t.template, path.parse(n).name);
        }));
      } else {
        variants.push(t);
      }
    });

    return variants;
  }

  function getDefaultVariant(variants) {
    if (variants.length === 1) return variants[0];
    return variants.find(s => s.name === "default");
  }

  var meta = {
    variants: {}
  };

  var variants = getVariants();
  meta.variants.list = variants;

  var defaultVariant = getDefaultVariant(variants);
  if (defaultVariant) meta.variants.default = defaultVariant;

  return meta;
};
