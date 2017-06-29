"use strict";

const fs = require("fs");
const types = require("../../types");
const parseYaml = require("../parse-yaml");
const jsonTemplates = require("../json-templates");
const lynxExport = require("./lynx");
const log = require("logatim");

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

function logDebug(header, value) {
  log.blue("# " + header + " #").debug();
  log.debug(JSON.stringify(value));
}

function processTemplate(pathOrTemplate, options, createFile) {
  logDebug("Processing Template", pathOrTemplate);

  let template = getTemplate(pathOrTemplate);
  logDebug("Template Object", template);

  template = jsonTemplates.expandTokens(template);
  logDebug("Tokens Expanded", template);

  let templatePath = types.isString(pathOrTemplate) ? pathOrTemplate : null;
  template = jsonTemplates.partials.expand(template, jsonTemplates.partials.resolve, templatePath);
  logDebug("Partials Processed", template);

  if (options && options.realm) {
    template = lynxExport.addRealm(options.realm.realm)(template);
    template = lynxExport.resolveRelativeUrls(options.realm.realm)(template);
  }

  template = lynxExport.calculateChildren(template);
  logDebug("Children calculated", template);

  if (options.flatten) {
    template = lynxExport.flatten(template);
    logDebug("Flattened", template);
  }

  if (options.spec) {
    template = lynxExport.extractSpecs(template, options, createFile);
    logDebug("Spec extracted", template);
  }

  return template;
}

module.exports = exports = processTemplate;
