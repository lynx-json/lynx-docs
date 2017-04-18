"use strict";

const fs = require("fs");
const types = require("../../types");
const parseYaml = require("../parse-yaml");
const jsonTemplates = require("../json-templates");
const lynxExport = require("./lynx");

function getTemplate(pathOrValue) {
  if (types.isString(pathOrValue)) {
    let buffer = fs.readFileSync(pathOrValue);
    try {
      return parseYaml(buffer);
    } catch (err) {
      err.message = "Error parsing YAML:\n".concat(err.message);
      throw err;
    }
  }

  return pathOrValue;
}

function addRealmToTemplate(realm, template) {
  if (realm && !template.realm) template.realm = realm;
}

function log(header, value) {
  console.log(header);
  console.log(JSON.stringify(value), "\n");

}

function processTemplate(pathOrValue, options, createFile) {
  let template = getTemplate(pathOrValue);
  if (options.log) log("### Template Options", options);

  template = jsonTemplates.expandTokens(template, options.inferInverse);
  if (options.log) log("### Tokens Expanded", template);

  let templatePath = types.isString(pathOrValue) ? pathOrValue : null;
  template = jsonTemplates.partials.expand(template, jsonTemplates.partials.resolve, templatePath, options.inferInverse);

  if (options.log) log("### Partials Processed", template);

  if (options && options.realm) {
    addRealmToTemplate(options.realm.realm, template);
    template = lynxExport.resolveRelativeUrls(options.realm.realm)(template);
  }

  template = lynxExport.calculateChildren(template);

  if (options.spec) {
    template = lynxExport.rollupSpecs(template);
    if (options.log) log("### Spec flattened", template);
    template = lynxExport.extractSpecs(template, createFile);
    if (options.log) log("### Spec extracted", template);

  }

  return template;
}

module.exports = exports = processTemplate;
