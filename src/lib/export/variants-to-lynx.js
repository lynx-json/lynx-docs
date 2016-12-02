"use strict";

var path = require("path");
var expandAndFinishTemplate = require("./expand-finish-template");
var kvpToHandlebars = require("../kvp-to-handlebars");
var templateData = require("../template-data");
var handlebars = require("handlebars");

function exportLynxDocuments(realms, createFile, options) {
  realms.forEach(realm => realm.variants
    .filter(variant => variant.template && variant.data) //only variants that have template and data
    .forEach(function (variant) {
      var variantOptions = Object.assign({}, options, { realm: realm });
      var content = transformVariantToLynx(variant, variantOptions);
      var outputPath = path.join(path.dirname(variant.template), path.basename(variant.template, ".yml") + ".lxn");
      createFile(outputPath, content);
    }));
}

function transformVariantToLynx(variant, options) {
  var kvp = expandAndFinishTemplate(variant.template, options);
  //TODO: Extract spec if set on options and emit spec content
  var content = kvpToHandlebars(kvp, options) + "\n";

  var data;
  if((typeof variant.data) === "string") {
    data = templateData(variant.data);
  } else {
    data = variant.data;
  }

  return bindData(content, data);
}

function bindData(content, data) {
  var template = handlebars.compile(content, { noEscape: true });
  return template(data);
}

exports.one = transformVariantToLynx;
exports.all = exportLynxDocuments;
