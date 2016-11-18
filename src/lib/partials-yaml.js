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
  partialsFolder = path.relative(process.cwd(), partialsFolder);
  
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

function applySimpleParameter(partialKVP, param) {
  // TODO: Convert to using metadata?
  // {{{}}} or {{}}
  var mustachePattern = new RegExp("{{{?" + param.key + "}}}?", "g");
  if (partialKVP.key) {
    partialKVP.key = partialKVP.key.replace(mustachePattern, param.value);
  }
  
  if (typeof partialKVP.value === "string") {
    partialKVP.value = partialKVP.value.replace(mustachePattern, param.value);
  }
  
  // param<: or param=:
  if (partialKVP.key) {
    let literalKeyPattern = new RegExp("^" + param.key + "[<=]$");
    
    if (literalKeyPattern.test(partialKVP.key)) {
      partialKVP.value = param.value;
      partialKVP.key = param.key;
    }
  }
  
  // key<param: or key=param:
  if (partialKVP.key) {
    let literalKeyPattern = new RegExp("^.*[<=]" + param.key + "$");
    
    if (literalKeyPattern.test(partialKVP.key)) {
      partialKVP.value = param.value;
      partialKVP.key = param.key;
    }
  }
}

function applySimpleParameters(partialKVP, params) {
  params.forEach(param => applySimpleParameter(partialKVP, param));
  
  if (partialKVP.value && (typeof partialKVP.value === "object") && !Array.isArray(partialKVP.value)) {
    let objectValue = {};
    for (var p in partialKVP.value) {
      var childKVP = { key: p, value: partialKVP.value[p]};
      applySimpleParameters(childKVP, params);
      objectValue[childKVP.key] = childKVP.value;
    }
    partialKVP.value = objectValue;
  }
}

function getPartialValue(kvp, options) {
  var partial = exports.resolvePartial(kvp, options);
  if (!partial) throw new Error("Failed to find partial " + kvp.value.partial);

  var params = [];
  params.push({ key: "key", value: kvp.key });
  
  for (let p in kvp.value) {
    params.push({ key: p, value: kvp.value[p] });
  }
  
  var partialKVP = { key: undefined, value: partial.value };
  applySimpleParameters(partialKVP, params);
  partial.value = partialKVP.value;

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
  if (kvp.key === undefined) delete kvp.key;
  
  return getPartialValue(kvp, options);
}

exports.isPartial = isPartial;
exports.getPartial = getPartial;
exports.resolvePartial = resolvePartial;
