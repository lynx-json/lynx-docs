"use strict";

const fs = require("fs");
const types = require("../../types");
const parseYaml = require("../parse-yaml");
const jsonTemplates = require("../json-templates");
const lynxExport = require("./lynx");

function getTemplate(pathOrTemplate) {
  if (types.isObject(pathOrTemplate) || types.isArray(pathOrTemplate)) return pathOrTemplate;
  if (types.isString(pathOrTemplate)) {
    let buffer = fs.readFileSync(pathOrTemplate);
    try {
      return parseYaml(buffer);
    } catch (err) {
      err.message = "Error parsing YAML:\n".concat(err.message);
      throw err;
    }
  }
  throw Error("Unexpected template value. Expected path to template or template object. Received \n" + JSON.stringify(pathOrTemplate));
}

function addRealmToTemplate(realm, template) {
  if (realm && !template.realm) template.realm = realm;
}

function log(header, value) {
  console.log(header);
  console.log(JSON.stringify(value), "\n");
}

function processTemplate(pathOrTemplate, options, createFile) {
  let template = getTemplate(pathOrTemplate);
  //if (options.log) log("### Template Options", options);

  if (options.log) log("### Template Source", template);

  template = jsonTemplates.expandTokens(template, options.inferInverse);
  if (options.log) log("### Tokens Expanded", template);

  let templatePath = types.isString(pathOrTemplate) ? pathOrTemplate : null;
  template = jsonTemplates.partials.expand(template, jsonTemplates.partials.resolve, templatePath, options.inferInverse);

  if (options.log) log("### Partials Processed", template);

  if (options && options.realm) {
    addRealmToTemplate(options.realm.realm, template);
    template = lynxExport.resolveRelativeUrls(options.realm.realm)(template);
  }

  template = lynxExport.calculateChildren(template);

  if (options.spec) {
    template = lynxExport.flatten(template);
    if (options.log) log("### Flattened", template);
    template = lynxExport.extractSpecs(template, createFile);
    if (options.log) log("### Spec extracted", template);

  }

  return template;
}

module.exports = exports = processTemplate;
