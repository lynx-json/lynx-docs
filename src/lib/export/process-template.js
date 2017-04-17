"use strict";

const fs = require("fs");
const types = require("../../types");
const parseYaml = require("../parse-yaml");
const expandTokens = require("../json-templates/expand-tokens");
const expandPartials = require("../json-templates/partials/expand");
const resolvePartials = require("../json-templates/partials/resolve");
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

function processTemplate(pathOrValue, options, createFile) {
  let template = getTemplate(pathOrValue);
  if (options.log) {
    console.log("### Template Options");
    console.log(JSON.stringify(options), "\n");
  }

  template = expandTokens.expand(template, options.inferInverse);

  if (options.log) {
    console.log("### Tokens Expanded");
    console.log(JSON.stringify(template), "\n");
  }

  let templatePath = types.isString(pathOrValue) ? pathOrValue : null;
  template = expandPartials.expand(template, resolvePartials.resolve, templatePath, options.inferInverse);
  if (options.log) {
    console.log("### Partials Processed");
    console.log(JSON.stringify(template), "\n");
  }

  if (options && options.realm) {
    addRealmToTemplate(options.realm.realm, template);
    template = lynxExport.resolveRelativeUrls(options.realm.realm)(template);
  }

  template = lynxExport.addChildren(template);

  //
  // if (options.spec) {
  //   finishedYaml = extractSpec(finishedYaml, options, createFile);
  // }
  //
  // if (options.log) {
  //   console.log("### Spec extracted");
  //   console.log(JSON.stringify(finishedYaml), "\n");
  // }

  return template;
}

module.exports = exports = processTemplate;
