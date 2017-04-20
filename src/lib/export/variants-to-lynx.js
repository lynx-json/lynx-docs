"use strict";

const util = require("util");
const path = require("path");
const processTemplate = require("./process-template");
const toHandlebars = require("../json-templates/to-handlebars");
const templateData = require("./template-data");
const handlebars = require("handlebars");
const jsonLint = require("json-lint");
const types = require("../../types");

handlebars.Utils.escapeExpression = function (toEscape) {
  if (toEscape === null || toEscape === undefined) return "";
  if (!types.isString(toEscape)) return toEscape;

  let stringified = JSON.stringify(toEscape);
  return stringified.substr(1, stringified.length - 2);
};

function exportLynxDocuments(realms, createFile, options) {
  realms.forEach(realm => realm.variants
    .filter(variant => variant.template) //only variants that have template and data
    .forEach(function (variant) {
      let variantOptions = Object.assign({}, options, { realm: realm });
      let content = transformVariantToLynx(variant, variantOptions, createFile);
      let outputPath = path.join(path.relative(realm.root, path.dirname(variant.template)), variant.name + ".lnx");
      createFile(outputPath, content);
    }));
}

function transformVariantToLynx(variant, options, createFile) {
  try {
    let template = processTemplate(variant.template, options, createFile);
    let hbContent = toHandlebars(template, options) + "\n";
    if (options.log) console.log("\nhandlebars content\n" + hbContent);

    let data = types.isString(variant.data) ? templateData(variant.data) : variant.data || null;
    let json = handlebars.compile(hbContent)(data);
    return lintContent(json, variant);
  } catch (err) {
    err.message = "Unable to export ".concat(util.inspect(variant.template), " to lynx format.\n\n", err.message);
    throw err;
  }
}

function lintContent(json, variant) {
  let linted = jsonLint(json);
  if (linted.error) {
    let message = "Failed JSON linting when data binding '".concat(variant.data, "'.\n");
    message += "\nNote: <<ERROR>> token denotes location of linting failure.\n"
      .concat(json.substr(0, linted.character - 1), "<<ERROR>>", json.substr(linted.character - 1));
    throw new Error(message);
  }
  return json;
}

exports.one = transformVariantToLynx;
exports.all = exportLynxDocuments;
