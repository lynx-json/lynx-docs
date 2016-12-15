"use strict";

const path = require("path");
const processTemplate = require("../process-template");
const kvpToHandlebars = require("./kvp");

function exportTemplatesToHandlebars(realms, createFile, options) {
  realms.forEach(realm => realm.templates
    .forEach(templatePath => {
      var templateOptions = Object.assign({}, options, { realm: realm });
      var content = transformTemplateToHandlebars(templatePath, templateOptions, createFile);
      var outputPath = path.join(path.relative(realm.root, path.dirname(templatePath)), path.basename(templatePath, ".yml") + ".handlebars");
      createFile(outputPath, content);
    }));
}

function transformTemplateToHandlebars(template, options, createFile) {
  try {
    var kvp = processTemplate(template, options, createFile);
    return kvpToHandlebars(kvp, options) + "\n";
  } catch(err) {
    err.message = "Unable to export ".concat(JSON.stringify(template), " to handlebars format.\n\n", err.message);
    throw err;
  }
}

module.exports = exports = exportTemplatesToHandlebars;
