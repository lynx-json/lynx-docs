"use strict";

const util = require("util");
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

function* params(kvp) {
  yield getMetadata({
    key: "key",
    value: kvp.key
  });
  
  if (kvp.value && util.isObject(kvp.value)) {
    for (let p in kvp.value) {
      yield getMetadata({
        key: p,
        value: kvp.value[p]
      });
    }
  }
}

function getParam(kvp, name) {
  for (let p of params(kvp)) {
    if (p.key === name) return p;
  }
}

function isObjectValue(value) {
  return util.isObject(value) && !util.isArray(value);
}

function collectKnownParameters(partialValue) {
  var paramPattern = /(\w*)?~(\w*|\*)?/g;
  var partialContent = YAML.stringify(partialValue);
  var result = [], match;
  while (match = paramPattern.exec(partialContent)) {
    let paramName = match[2] || match[1];
    paramName = getMetadata({ key: paramName}).key;
    if (result.indexOf(paramName) === -1) result.push(paramName);
  }
  
  return result;
}

function applyWildcardParameters(inputKVP, outputKVP, knownParameters) {
  for (let p in inputKVP.value) {
    if (p === "partial" || p === "value" || p === "key") continue;
    let param = getMetadata({
      key: p,
      value: inputKVP.value[p]
    });
    
    if (knownParameters.indexOf(param.key) === -1) {
      outputKVP[param.src.key] = param.src.value;
    }
  }
}

function applyParameters(partialValue, kvp, knownParameters) {
  if (!util.isObject(partialValue)) return partialValue;
  if (!kvp.value) return partialValue;
  
  if (!knownParameters) knownParameters = collectKnownParameters(partialValue);
  
  var result = {};
  
  for (let p in partialValue) {
    let paramPattern = /(\w*)?~(\w*|\*)?/;
    let match = paramPattern.exec(p);
    
    let partialChildValue = partialValue[p];
    if (match) {
      let paramName = match[2] || match[1];
      
      if (paramName === "*") {
        applyWildcardParameters(kvp, result, knownParameters);
        continue;
      }
      
      // Apply explicit parameter
      let param = getParam(kvp, paramName);
      
      if (param) {
        delete result[param.src.key]; // If it was added to the catchall
        result[param.src.key] = param.src.value;
        continue;
      }
    } else if (isObjectValue(partialChildValue)) {
      result[p] = applyParameters(partialChildValue, kvp, knownParameters);
      continue;
    }
    
    let key = p.replace(/~.*$/, "");
    if (partialChildValue !== null && partialChildValue !== undefined) {
      result[key] = partialChildValue;
    } 
    
    let meta = getMetadata(key);
    if (meta.template) result[key] = partialChildValue;
  }
  
  return result;
}

function getPartialKVP(kvp, options) {
  var partial = exports.resolvePartial(kvp, options);
  partial.value = applyParameters(partial.value, kvp);
  
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
  kvp.value.key = meta.src.key.replace(/>.*/, "");
  kvp.key = meta.key;
  if (kvp.key === undefined) delete kvp.key;
  
  return getPartialKVP(kvp, options);
}

exports.isPartial = isPartial;
exports.getPartial = getPartial;
exports.resolvePartial = resolvePartial;
