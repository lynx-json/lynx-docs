"use strict";

const util = require("util");
const path = require("path");
const processTemplate = require("./process-template");
const toHandlebars = require("../json-templates/to-handlebars");

function exportTemplatesToHandlebars(realms, createFile, options) {
  realms.forEach(realm => realm.templates
    .forEach(templatePath => {
      if (options.template) {
        var regex = new RegExp(options.template);
        if (regex.test(templatePath) === false) return;
      }

      var templateOptions = Object.assign({}, options, { realm: realm });
      var content = transformTemplateToHandlebars(templatePath, templateOptions, createFile);
      var outputPath = path.join(path.relative(realm.root, path.dirname(templatePath)), path.basename(templatePath, ".yml") + ".handlebars");
      createFile(outputPath, content);
    }));
}

function transformTemplateToHandlebars(pathOrTemplate, options, createFile) {
  try {
    var template = processTemplate(pathOrTemplate, options, createFile);
    return toHandlebars(template, options.handlebars) + "\n";
  } catch (err) {
    err.message = "Unable to export ".concat(util.inspect(pathOrTemplate), " to handlebars format.\n\n", err.message);
    throw err;
  }
}

exports.all = exportTemplatesToHandlebars;
exports.one = transformTemplateToHandlebars;
