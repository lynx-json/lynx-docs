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

const fallbackPartialsFolder = path.join(__dirname, "_partials");

function resolvePartial(kvp, options) {
  var value = kvp.value,
    key = kvp.key;
  var partialsFolder = path.join(path.dirname(options.context || options.input), "_partials");

  var value = kvp.value,
    key = kvp.key;
  if(!options.input) throw new Error("Expected 'options' param to have 'input' key.");

  while(partialsFolder) {
    let partialFile = path.join(partialsFolder, value.partial + ".js");
    if(fs.existsSync(partialFile)) {
      //TODO: Since we're using require, the js is cached, so a change requires restarting the
      // the server. Consider using something like decache module.
      return require(partialFile)(kvp, options);
    }

    partialFile = path.join(partialsFolder, value.partial + ".yml");

    if(fs.existsSync(partialFile)) {
      let content = fs.readFileSync(partialFile);
      return {
        key: key,
        value: parseYaml(content)
      };
    }

    if(path.dirname(partialsFolder) === process.cwd()) partialsFolder = fallbackPartialsFolder;
    else if(partialsFolder === fallbackPartialsFolder) partialsFolder = null;
    else partialsFolder = path.join(path.dirname(path.dirname(partialsFolder)), "_partials");
  }

  throw new Error("Failed to resolve partial " + value.partial);
}

function* params(kvp) {
  yield getMetadata({
    key: "key",
    value: kvp.key
  });

  if(kvp.value && util.isObject(kvp.value)) {
    for(let p in kvp.value) {
      yield getMetadata({
        key: p,
        value: kvp.value[p]
      });
    }
  }
}

function getParam(kvp, name) {
  for(let p of params(kvp)) {
    if(p.key === name) return p;
  }
}

function collectKnownParameters(partialValue) {
  var paramPattern = /(\w*)?~(\w*|\*)?/g;
  var partialContent = YAML.stringify(partialValue);
  var result = [],
    match;
  while(match = paramPattern.exec(partialContent)) {
    let paramName = match[2] || match[1];
    paramName = getMetadata({
      key: paramName
    }).key;
    if(result.indexOf(paramName) === -1) result.push(paramName);
  }

  return result;
}

function applyWildcardParameters(inputKVP, outputKVP, knownParameters) {
  for(let p in inputKVP.value) {
    if(p === "partial" || p === "value" || p === "key") continue;
    let param = getMetadata({
      key: p,
      value: inputKVP.value[p]
    });

    if(knownParameters.indexOf(param.key) === -1) {
      outputKVP[param.src.key] = param.src.value;
    }
  }
}

function applyParameters(partialValue, kvp, knownParameters) {
  if(!util.isObject(partialValue)) return partialValue;
  if(!kvp.value) return partialValue;

  if(!knownParameters) knownParameters = collectKnownParameters(partialValue);

  if(util.isArray(partialValue)) {
    return partialValue.map(item => applyParameters(item, kvp, knownParameters));
  }

  var result = {};

  for(let p in partialValue) {
    let paramPattern = /(\w*)?~(\w*|\*)?/;
    let match = paramPattern.exec(p);

    let partialChildValue = partialValue[p];
    if(match) {
      let paramName = match[2] || match[1];

      if(paramName === "*") {
        applyWildcardParameters(kvp, result, knownParameters);
        continue;
      }

      // Apply explicit parameter
      let param = getParam(kvp, paramName);

      if(param) {
        let pMeta = getMetadata({
          key: p.replace(/~.*$/, "")
        });

        // Case: data~value: data should be the output key.
        let key = param.src.key;
        if(param.key !== pMeta.key) {
          key = pMeta.key;
          if(param.template) key += param.template.section;
          if(param.partial) key += ">" + param.partial;
        }
        result[key] = param.src.value;

        continue;
      }
    } else if(util.isObject(partialChildValue)) {
      result[p] = applyParameters(partialChildValue, kvp, knownParameters);
      continue;
    }

    // If the value is not null or undefined, include it
    // even if there was no match.
    let key = p.replace(/~.*$/, "");
    if(partialChildValue !== null && partialChildValue !== undefined) {
      result[key] = partialChildValue;
    }

    // Or if the value is a template or partial reference, include it.
    let meta = getMetadata(key);
    if(meta.template || meta.partial) result[key] = partialChildValue;
  }

  return result;
}

function getPartialKVP(kvp, options) {
  var partial = exports.resolvePartial(kvp, options);
  partial.value = applyParameters(partial.value, kvp);

  return partial;
}

function normalizeValueToObject(kvp) {
  if(kvp.value === null || kvp.value === undefined)
    kvp.value = {};
  else if(Array.isArray(kvp.value) || typeof kvp.value !== "object")
    kvp.value = {
      value: kvp.value
    };

  return kvp;
}

function getPartial(kvp, options) {
  kvp = normalizeValueToObject(kvp);
  var meta = getMetadata(kvp);

  kvp.value.partial = meta.partial;
  kvp.value.key = meta.src.key.replace(/>.*/, "");
  kvp.key = kvp.value.key;

  var result = getPartialKVP(kvp, options);
  return result;
}

exports.isPartial = isPartial;
exports.getPartial = getPartial;
exports.resolvePartial = resolvePartial;
