"use strict";

const util = require("util");
const fs = require("fs");
const parseYaml = require("./parse-yaml");
const YAML = require("yamljs");
const path = require("path");
const getMetadata = require("./metadata-yaml");
const paramPattern = () => /([*.-\w]*)?~([*.-\w]*)?/g;

function isPartial(kvp) {
  return getMetadata(kvp).partial !== undefined;
}

const fallbackPartialsFolder = path.join(__dirname, "_partials");

function parseParamName(fullName) {
  var namespacePattern = /(?:([.-\w]*)\.)?(.*)/g;
  var match = namespacePattern.exec(fullName);
  
  return {
    name: match[2],
    namespace: match[1],
    fullName: fullName
  };
}

function resolvePartial(kvp, options) {
  var value = kvp.value,
    key = kvp.key;
  var partialsFolder = path.join(options.realm.folder, "_partials");
  
  if (value.partial.startsWith("+")) {
    if (!options.partials.context) throw new Error("Expected a partials.context for resolution of global partial.");
    partialsFolder = path.join(path.dirname(path.dirname(path.dirname(options.partials.context))), "_partials");
    if (partialsFolder.indexOf(process.cwd()) !== 0) partialsFolder = fallbackPartialsFolder;
    
    value.partial = value.partial.replace(/^\+/, "");
  }

  while(partialsFolder) {
    let partialFile = path.join(partialsFolder, value.partial + ".js");
    if(fs.existsSync(partialFile)) {
      //TODO: Since we're using require, the js is cached, so a change requires restarting the
      // the server. Consider using something like decache module.
      let result = require(partialFile)(kvp, options);
      result.location = partialFile;
      
      return result;
    }

    partialFile = path.join(partialsFolder, value.partial + ".yml");

    if(fs.existsSync(partialFile)) {
      let content = fs.readFileSync(partialFile);
      
      let yaml = parseYaml(content);
      
      return {
        key: key,
        value: yaml,
        location: partialFile
      };
    }

    if(path.dirname(partialsFolder) === process.cwd()) partialsFolder = fallbackPartialsFolder;
    else if(partialsFolder === fallbackPartialsFolder) partialsFolder = null;
    else partialsFolder = path.join(path.dirname(path.dirname(partialsFolder)), "_partials");
  }
}

function* params(kvp) {
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
  var pattern = paramPattern();
  var partialContent = YAML.stringify(partialValue);
  var result = [],
    match;
  /*jshint ignore:start */
  while(match = pattern.exec(partialContent)) {
    let paramName = match[2] || match[1];
    let meta = getMetadata({ key: paramName });
    paramName = meta.key || paramName;
    
    if(result.indexOf(paramName) === -1) result.push(paramName);
  }
  /*jshint ignore:end */

  return result;
}

function applyWildcardParameters(inputKVP, outputKVP, knownParameters, namespace) {
  for(let p in inputKVP.value) {
    if(p === "partial" || p === "value" || p === "key") continue;
    let param = getMetadata({
      key: p,
      value: inputKVP.value[p]
    });
    
    let parsedKey = parseParamName(param.src.key);
    
    if (parsedKey.namespace !== namespace) continue;

    if(knownParameters.indexOf(param.key) === -1) {
      outputKVP[parsedKey.name] = param.src.value;
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
    let pattern = paramPattern();
    let match = pattern.exec(p);

    let partialChildValue = partialValue[p];
    if(match) {
      let paramName = parseParamName(match[2] || match[1]);

      if(paramName.name === "*") {
        applyWildcardParameters(kvp, result, knownParameters, paramName.namespace);
        continue;
      }

      // Apply explicit parameter
      let param = getParam(kvp, paramName.fullName);

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
  if (!partial) return;
  
  // Allow YAML partial to redefine the key.
  // This is necessary in order to allow a partial to defer to another partial.
  let props = Object.getOwnPropertyNames(partial.value);
  if (props.length === 1) {
    let key = props[0].replace(/~.*$/, "");
    if (getMetadata(key).key === undefined) {
      partial.key = partial.key ? partial.key + props[0] : props[0];
      partial.value = partial.value[props[0]];
    }
  }
  
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
  options = options || {};
  kvp = normalizeValueToObject(kvp);
  var meta = getMetadata(kvp);

  kvp.value.partial = meta.partial;
  kvp.value.key = meta.src.key.replace(/>.*/, "");
  kvp.key = kvp.value.key;

  var result = getPartialKVP(kvp, options);
  if (!result) return;
  
  if (isPartial(result)) {
    options.partials = {
      context: result.location
    };
    result = getPartial(result, options);
    return result;
  }
  
  return result;
}

exports.getParam = getParam;
exports.isPartial = isPartial;
exports.getPartial = getPartial;
exports.resolvePartial = resolvePartial;
