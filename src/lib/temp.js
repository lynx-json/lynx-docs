"use strict";

const util = require("util");
const fs = require("fs");
const parseYaml = require("./parse-yaml");
const YAML = require("yamljs");
const path = require("path");
const getMetadata = require("./metadata-yaml");
const placeholderPattern = () => /([*.-\w]*)?~([*.-\w]*)?/g;

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

function* getParams(kvp) {
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
  for(let p of getParams(kvp)) {
    if(p.key === name) return p;
  }
}

function collectKnownParameters(partial) {
  var pattern = placeholderPattern();
  var partialContent = YAML.stringify(partial);
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

function* applyWildcards(partialKVP, paramsKVP, knownParameters) {
  let pattern = placeholderPattern();
  
  let match = pattern.exec(partialKVP.key);
  if (!match) return;
  
  let placeholderName = parseParamName(match[2] || match[1]);
  if (placeholderName.name !== "*") return;
  
  for(let p in paramsKVP.value) {
    if(p === "partial" || p === "value" || p === "key") continue;
    let param = getMetadata({
      key: p,
      value: paramsKVP.value[p]
    });
    
    let parsedParamName = parseParamName(param.src.key);
    
    if (parsedParamName.namespace !== placeholderName.namespace) continue;

    if(knownParameters.indexOf(param.key) === -1) {
      yield {
        key: parsedParamName.name,
        value: param.src.value
      }
    }
  }
}

function getKeyFromPlaceholder(paramName) {
  return paramName.replace(/~.*$/, "");
}

function applyExplicitPlaceholders(partialKVP, paramsKVP) {
  let pattern = placeholderPattern();
  
  let match = pattern.exec(partialKVP.key);
  if (!match) return;
  
  let param = getParam(paramsKVP, match[2] || match[1]);
  if (!param) return;
  
  let newKey = param.src.key;
  let keyFromPlaceholder = getKeyFromPlaceholder(partialKVP.key);
  
  // The partial key wins, but we need to copy template and partial info from
  // the param key.
  if(param.key !== keyFromPlaceholder) {
    newKey = keyFromPlaceholder;
    if(param.template) newKey += param.template.section;
    if(param.partial) newKey += ">" + param.partial;
  }
  
  return {
    key: newKey,
    value: param.src.value
  };
}

function applyParameters(partialKVP, paramsKVP, knownParameters) {
  if(!util.isObject(partialKVP.value)) return partialKVP;
  if(!paramsKVP.value) return partialKVP;

  if(!knownParameters) knownParameters = collectKnownParameters(partialKVP);

  if(util.isArray(partialKVP.value)) {
    partialKVP.value = partialKVP.value.map(item => applyParameters({ value: item }, paramsKVP, knownParameters).value);
    return partialKVP;
  }

  var result = {};

  for(let p in partialKVP.value) {
    let partialChildKVP = { key: p, value: partialKVP.value[p]};
    
    let isWildcard = partialChildKVP.key.indexOf("*") !== -1;
    if (isWildcard) {
      for (let r of applyWildcards(partialChildKVP, paramsKVP, knownParameters)) {
        result[r.key] = r.value;
      }
      continue;
    }
    

    let explicitResult = applyExplicitPlaceholders(partialChildKVP, paramsKVP);
    if (explicitResult) {
      result[explicitResult.key] = explicitResult.value;
      continue;
    }
    
    // TODO: Would it simplify things if I were not continuing above and just fall through to this one?
    if(util.isObject(partialChildKVP.value)) {
      let objectResult = applyParameters(partialChildKVP, paramsKVP, knownParameters);
      result[objectResult.key] = objectResult.value;
      continue;
    }

    // If the value is not null or undefined, include it
    // even if there was no match.
    let key = getKeyFromPlaceholder(partialChildKVP.key);
    // if (!key) {
    //   console.log("WTF", partialChildKVP.key);
    //   continue;
    // }
    
    if(partialChildKVP.value !== null && partialChildKVP.value !== undefined) {
      result[key] = partialChildKVP.value;
    }
    
    // partial value
    // : one: "foo ~{{bar}}"
    // if (typeof partialChildValue === "string") {
    //   let inlineParamPattern = new RegExp("~{{" + paramName.fullName + "(?:|([^}]*))?}}", "g");
    //   result[key] = partialChildValue.replace()
    //   param.src.value;
    // }
    
    // Or if the value is a template or partial reference, include it.
    
    let meta = getMetadata(key);
    if(meta.template || meta.partial) result[key] = partialChildKVP.value;
  }

  partialKVP.value = result;
  return partialKVP;
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
  
  return applyParameters(partial, kvp);
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
