"use strict";

const fs = require("fs");
const util = require("util");
const parseYaml = require("../parse-yaml");
const expandTemplates = require("../json-templates/expand-templates");
const expandPartials = require("../json-templates/partials/expand").expand;
const resolvePartial = require("../json-templates/partials/resolve").resolve;
const flatten = require("./flatten");

function getTemplate(pathOrValue) {
  if (typeof pathOrValue === "string") {
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

function processTemplate(pathOrValue, options, createFile) {
  let template = getTemplate(pathOrValue);
  if (options.log) {
    console.log("### Template Options");
    console.log(JSON.stringify(options), "\n");
  }

  template = expandTemplates(template, options);
  let templatePath = util.isString(pathOrValue) ? pathOrValue : null;
  template = expandPartials(template, resolvePartial, templatePath);

  if (options.log) {
    console.log("### Expanded");
    console.log(JSON.stringify(expanded), "\n");
  }

  if (options.flatten) {
    template = flatten(expanded);
  }

  if (options.log) {
    console.log("### Flattened");
    console.log(JSON.stringify(finishedYaml), "\n");
  }
  //
  // if (options.spec) {
  //   finishedYaml = extractSpec(finishedYaml, options, createFile);
  // }
  //
  // if (options.log) {
  //   console.log("### Spec extracted");
  //   console.log(JSON.stringify(finishedYaml), "\n");
  // }

  if (options.realm) template["realm"] = options.realm.realm;

  return template;
}

module.exports = exports = processTemplate;
