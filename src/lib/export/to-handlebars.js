"use strict";

const util = require("util");
const path = require("path");
const processTemplate = require("./process-template");
const toHandlebars = require("../json-templates").toHandlebars;

function exportTemplatesToHandlebars(realms, createFile, options) {
  realms.forEach(realm => realm.templates
    .forEach(template => {
      if (options.template) {
        var regex = new RegExp(options.template);
        if (regex.test(template.path) === false) return;
      }

      var templateOptions = Object.assign({}, options, { realm: realm });
      var content = transformTemplateToHandlebars(template.path, templateOptions, createFile);
      var outputPath = path.join(path.relative(realm.root, path.dirname(template.path)), path.basename(template.path, ".yml") + ".handlebars");
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
