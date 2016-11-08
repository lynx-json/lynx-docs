"use strict";

const fs = require("fs");
const parseYaml = require("./parse-yaml");
const YAML = require("yamljs");
const path = require("path");
const getMetadata = require("./metadata-yaml");

function isPartial(kvp) {
  return getMetadata(kvp).partial !== undefined;
}

function resolvePartial(kvp, options) {
  var value = kvp.value, key = kvp.key;
  var partialsFolder = path.dirname(options.input);
  
  while (partialsFolder) {
    let partialFile = path.join(process.cwd(), partialsFolder, "_partials", value.partial + ".js");
    if (fs.existsSync(partialFile)) {
      //TODO: Since we're using require, the js is cached, so a change requires restarting the
      // the server. Consider using something like decache module.
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

function normalizeValueToObject(kvp) {
  if (kvp.value === null || kvp.value === undefined) 
    kvp.value = {};
  else if (Array.isArray(kvp.value) || typeof kvp.value !== "object") 
    kvp.value = { value: kvp.value };
  
  return kvp;
}

function getPartial(kvp, options) {
  kvp = normalizeValueToObject(kvp);
  var meta = getMetadata(kvp);
  
  kvp.value.partial = meta.partial;
  kvp.key = meta.key;
  
  return getPartialValue(kvp, options);
}

exports.isPartial = isPartial;
exports.getPartial = getPartial;
exports.resolvePartial = resolvePartial;
