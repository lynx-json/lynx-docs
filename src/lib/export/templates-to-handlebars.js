"use strict";

var path = require("path");
var expandAndFinishTemplate = require("./expand-finish-template");
var kvpToHandlebars = require("../kvp-to-handlebars");

function exportTemplatesToHandlebars(realms, createFile, options) {
  realms.forEach(realm => realm.templates
    .forEach(templatePath => {
      var templateOptions = Object.assign({}, options, { realm: realm });
      var content = transformTemplateToHandlebars(templatePath, templateOptions);
      var outputPath = path.join(path.dirname(templatePath), path.basename(templatePath, ".yml") + ".handlebars");
      createFile(outputPath, content);
    }));
}

function transformTemplateToHandlebars(templatePath, options) {
  var kvp = expandAndFinishTemplate(templatePath, options);
  return kvpToHandlebars(kvp, options) + "\n";
}

module.exports = exports = exportTemplatesToHandlebars;
