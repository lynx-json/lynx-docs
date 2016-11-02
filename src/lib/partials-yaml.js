"use strict";

const fs = require("fs");
const parseYaml = require("./parse-yaml");
const YAML = require("yamljs");
const path = require("path");
const partialKeyPattern = /^.*>(.*)?$/;

function isPartial(kvp) {
  return partialKeyPattern.test(kvp.key);
}

function resolvePartial(kvp, options) {
  var value = kvp.value, key = kvp.key;
  var partialsFolder = path.dirname(options.input);
  
  while (partialsFolder) {
    let partialFile = path.join(process.cwd(), partialsFolder, "_partials", value.partial + ".js");
    if (fs.existsSync(partialFile)) {
      return require(partialFile)(kvp, options);
    }
    
    partialFile = path.join(process.cwd(), partialsFolder, "_partials", value.partial + ".yml");
    
    if (fs.existsSync(partialFile)) {
      let content = fs.readFileSync(partialFile);
      return { key: key, value: parseYaml(content) };
    }
    
    if (partialsFolder !== ".") partialsFolder = path.dirname(partialsFolder);
    else partialsFolder = null;
  }
}

function applySimpleParameter(content, param) {
  let mustachePattern = new RegExp("{{{" + param.key + "}}}", "gm");
  content = content.replace(mustachePattern, param.value);
  
  // param<:
  let literalPattern = new RegExp("^['\"]?" + param.key + "<" + "['\"]?" + ":.*$", "gm");
  content = content.replace(literalPattern, param.key + ": " + param.value);
  
  // key<param:
  let namedLiteralPattern = new RegExp("['\"]?.*<" + param.key + "['\"]?" + ":.*$", "gm");
  content = content.replace(namedLiteralPattern, param.key + ": " + param.value);
  
  return content;
}

function getPartialValue(kvp, options) {
  var value = kvp.value, key = kvp.key;
  var partial = exports.resolvePartial(kvp, options);
  if (!partial) throw new Error("Failed to find partial " + value.partial);

  // Replace simple parameters.
  var content = YAML.stringify(partial.value);
  content = applySimpleParameter(content, { key: "key", value: key });

  for (let p in value) {
    content = applySimpleParameter(content, { key: p, value: value[p] });
  }

  partial.value = YAML.parse(content);
  return partial;
}

function getPartial(kvp, options) {
  var value = kvp.value, key = kvp.key;
  var isExplicitValue = typeof value !== "object" || Array.isArray(value) || value === null;
  if (isExplicitValue) {
    let originalValue = value;
    kvp.value = value = {};
    if (originalValue) value.value = originalValue;
  }

  // If a partial name is specified like this: key>partial-name
  var match = partialKeyPattern.exec(key);
  if (match[1]) value.partial = match[1];
  
  // Otherwise the partial name is assumed to be the key name: partial-name>
  kvp.key = key = key.replace(/>.*$/, "");
  if (!value.partial) value.partial = key;
  
  return getPartialValue(kvp, options);
}

exports.isPartial = isPartial;
exports.getPartial = getPartial;
exports.resolvePartial = resolvePartial;
