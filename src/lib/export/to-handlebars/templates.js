"use strict";

const path = require("path");
const expandAndFinishTemplate = require("../expand-finish-template");
const kvpToHandlebars = require("./kvp");

function exportTemplatesToHandlebars(realms, createFile, options) {
  realms.forEach(realm => realm.templates
    .forEach(templatePath => {
      var templateOptions = Object.assign({}, options, { realm: realm });
      var content = transformTemplateToHandlebars(templatePath, templateOptions);
      var outputPath = path.join(path.relative(realm.root, path.dirname(templatePath)), path.basename(templatePath, ".yml") + ".handlebars");
      createFile(outputPath, content);
    }));
}

function transformTemplateToHandlebars(templatePath, options) {
  try {
    var kvp = expandAndFinishTemplate(templatePath, options);
    return kvpToHandlebars(kvp, options) + "\n";
  } catch(err) {
    err.message = "Unable to export '".concat(templatePath, "' to handlebars format.\n", err.message);
    throw err;
  }
}

module.exports = exports = exportTemplatesToHandlebars;
