"use strict";

const util = require("util");
const path = require("path");
const processTemplate = require("./process-template");
const toHandlebars = require("../json-templates/to-handlebars");
const templateData = require("./template-data");
const handlebars = require("handlebars");
const jsonLint = require("json-lint");

handlebars.Utils.escapeExpression = function (val) {
  if (val === null || val === undefined) return "";
  if (typeof val !== "string") return val;

  var temp = JSON.stringify(val);
  return temp.substr(1, temp.length - 2);
};

function exportLynxDocuments(realms, createFile, options) {
  realms.forEach(realm => realm.variants
    .filter(variant => variant.template) //only variants that have template and data
    .forEach(function (variant) {
      var variantOptions = Object.assign({}, options, { realm: realm });
      var content = transformVariantToLynx(variant, variantOptions, createFile);
      var outputPath = path.join(path.relative(realm.root, path.dirname(variant.template)), variant.name + ".lnx");
      createFile(outputPath, content);
    }));
}

function transformVariantToLynx(variant, options, createFile) {
  try {
    var template = processTemplate(variant.template, options, createFile);
    var content = toHandlebars(template, options) + "\n";
    if (options.log) console.log("\nhandlebars content\n" + content);

    var data;
    if ((typeof variant.data) === "string") {
      data = templateData(variant.data);
    } else {
      data = variant.data || null;
    }
    return lintContent(bindData(content, data), variant);
  } catch (err) {
    err.message = "Unable to export ".concat(util.inspect(variant.template), " to lynx format.\n\n", err.message);
    throw err;
  }
}

function bindData(content, data) {
  var template = handlebars.compile(content);
  return template(data);
}

function lintContent(content, variant) {
  var linted = jsonLint(content);
  if (linted.error) {
    var message = "Failed JSON linting when data binding '".concat(variant.data, "'.\n");
    message += "\nNote: <<ERROR>> token denotes location of linting failure.\n"
      .concat(content.substr(0, linted.character - 1), "<<ERROR>>", content.substr(linted.character - 1));
    throw new Error(message);
  }
  return content;
}

exports.one = transformVariantToLynx;
exports.all = exportLynxDocuments;
