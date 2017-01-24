"use strict";

const util = require("util");
const fs = require("fs");
const parseYaml = require("./parse-yaml");
const YAML = require("yamljs");
const path = require("path");
const getMetadata = require("./metadata-yaml");
const placeholderPattern = () => /([*.-\w]*)(?:[#@<>=]*)~([#@<>*.-\w]*)/g;
const conditionalPlaceholderPattern = () => /([#@<>=*.-\w]*)(~[#@<>=*.-\w]*)?\?(.*)/g;

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

  if(value.partial.startsWith("+")) {
    if(!options.partials.context) throw new Error("Expected a partials.context for resolution of global partial.");
    partialsFolder = path.join(path.dirname(path.dirname(path.dirname(options.partials.context))), "_partials");
    if(partialsFolder.indexOf(process.cwd()) !== 0) partialsFolder = fallbackPartialsFolder;

    value.partial = value.partial.replace(/^\+/, "");
  }

  while(partialsFolder) {
    let partialFile = path.join(partialsFolder, value.partial + ".js");
    if(fs.existsSync(partialFile)) {
      //Since we're using require, the js is cached, so a change
      //will not be loaded unless we clear require cache.
      delete require.cache[require.resolve(partialFile)];
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
    if(!paramName) continue;

    let meta = getMetadata({ key: paramName });
    paramName = meta.key || paramName;

    if(result.indexOf(paramName) === -1) {
      result.push(parseParamName(paramName));
    }
  }
  /*jshint ignore:end */

  return result.sort(function (a, b) {
    if(a.fullName === b.fullName) return 0;
    if(a.fullName.indexOf(b.fullName) === 0) return 1;
    if(b.fullName.indexOf(a.fullName) === 0) return -1;
    if(a.fullName < b.fullName) return 1;
    if(a.fullName > b.fullName) return -1;
  });
}

function* replaceWildcardPlaceholders(partialKVP, paramsKVP, knownParameters) {
  let pattern = placeholderPattern();

  let match = pattern.exec(partialKVP.key);
  if(!match) return;

  let placeholderName = parseParamName(match[2] || match[1]);
  if(placeholderName.name !== "*") return;

  function isMostSpecificPlaceholderFor(param) {
    let match = knownParameters.find(k => param.key === k.fullName || param.fullName === k.fullName ||
      (param.fullName.startsWith(k.namespace) && k.name === "*") ||
      k.fullName === "*");

    return match && match.fullName === placeholderName.fullName;
  }

  for(let p in paramsKVP.value) {
    if(p === "partial" || p === "key" || p === "template") continue;
    let param = getMetadata({ key: p, value: paramsKVP.value[p] });
    param = Object.assign({}, param, parseParamName(param.src.key));

    if(isMostSpecificPlaceholderFor(param)) {
      // spec.*~input.spec.* -> spec.key: value
      if(match[1]) {
        yield {
          key: match[1].replace("*", param.name),
          value: param.src.value
        };
      } else {
        yield {
          key: param.fullName.replace(placeholderName.namespace + ".", ""),
          value: param.src.value
        };
      }
    }
  }
}

function getMetaKeyWithoutPlaceholder(paramName) {
  var key = paramName.replace(/~[^{]*$/, "");
  return getMetadata(key);
}

// Conditional placeholders are in the form 'key~param?condition'. The partial
// provides a value that should only be used in the case where a param with a 
// name matching the condition was provided.
function applyConditionalPlaceholders(partialKVP, paramsKVP) {
  var pattern = conditionalPlaceholderPattern();

  var match = pattern.exec(partialKVP.key);
  if(!match) return partialKVP;

  var key = match[1];
  var placeholder = match[2];
  var condition = new RegExp(match[3]);
  var params = getParams(paramsKVP);
  var matchesCondition = false;
  for(let p of params) {
    if(condition.test(p.key)) {
      matchesCondition = true;
      continue;
    }
  }

  if(!matchesCondition) return null;

  partialKVP.key = key;
  if(placeholder) partialKVP.key += placeholder;
  return partialKVP;
}

// Explicit placeholders (as opposed to wildcard placeholders)
// are in the form 'key~param'.
function replaceExplicitPlaceholders(partialKVP, paramsKVP) {
  var pattern = placeholderPattern();

  var match = pattern.exec(partialKVP.key);
  if(!match) return partialKVP;

  var metaFromPlaceholder = getMetaKeyWithoutPlaceholder(partialKVP.key);
  var param = getParam(paramsKVP, match[2] || match[1]);
  var newKey = param ? param.src.key : metaFromPlaceholder.src.key;

  if(!param) {
    if(partialKVP.value !== null && partialKVP.value !== undefined) {
      return {
        key: newKey,
        value: partialKVP.value
      };
    }

    let meta = getMetadata(newKey);
    if(meta.template || meta.partial) {
      return {
        key: newKey,
        value: partialKVP.value
      };
    }

    return;
  }

  // The partial key wins, but we need to copy template and partial info from
  // the param key.
  if(param.key !== metaFromPlaceholder.key) {
    newKey = metaFromPlaceholder.key;
    if(param.template) newKey += param.template.section;
    if(param.partial) newKey += ">" + param.partial;
  }

  return {
    key: newKey,
    value: param.src.value
  };
}

function applyParametersToChildrenOfObject(partialKVP, paramsKVP, knownParameters) {
  var result = {};

  for(let p in partialKVP.value) {
    let partialChildKVP = { key: p, value: partialKVP.value[p] };

    let isWildcard = partialChildKVP.key.indexOf("*") !== -1;
    if(isWildcard) {
      for(let r of replaceWildcardPlaceholders(partialChildKVP, paramsKVP, knownParameters)) {
        result[r.key] = r.value;
      }
      continue;
    }

    let childResult = applyParameters(partialChildKVP, paramsKVP, knownParameters);
    if(childResult) result[childResult.key] = childResult.value;
  }

  partialKVP.value = result;
  return partialKVP;
}

function applyParametersToChildrenOfArray(partialKVP, paramsKVP, knownParameters) {
  partialKVP.value = partialKVP.value.map(item => applyParameters({ value: item }, paramsKVP, knownParameters).value);
  return partialKVP;
}

const inlineParameterPattern = /~{{([^}^|]*)(?:\|([^}]*))?}}/g;

// Inline placeholders are for replacing part of a string value. They
// are in the form ~{{param|Default Value}}
function replaceInlinePlaceholders(partialKVP, paramsKVP) {
  function replace(text) {
    for(var p in paramsKVP.value) {
      let param = getMetadata({
        key: p,
        value: paramsKVP.value[p]
      });

      if(param.src.value === null || param.src.value === undefined) continue;
      let pattern = new RegExp("~{{" + param.key + "(?:\|([^}]*))?}}", "g");
      text = text.replace(pattern, param.src.value);
    }

    text = text.replace(inlineParameterPattern, "$2");

    return text;
  }

  if(partialKVP.value && (typeof partialKVP.value === "string")) {
    partialKVP.value = replace(partialKVP.value);
  }

  if(partialKVP.key) {
    partialKVP.key = replace(partialKVP.key);
  }

  return partialKVP;
}

function applyParameters(partialKVP, paramsKVP, knownParameters) {
  if(!paramsKVP.value) return partialKVP;

  if(!knownParameters) knownParameters = collectKnownParameters(partialKVP);

  if(util.isArray(partialKVP.value)) {
    partialKVP = applyParametersToChildrenOfArray(partialKVP, paramsKVP, knownParameters);
  } else if(util.isObject(partialKVP.value)) {
    partialKVP = applyParametersToChildrenOfObject(partialKVP, paramsKVP, knownParameters);
  }

  partialKVP = applyConditionalPlaceholders(partialKVP, paramsKVP);
  if(!partialKVP) return partialKVP;

  partialKVP = replaceInlinePlaceholders(partialKVP, paramsKVP);
  partialKVP = replaceExplicitPlaceholders(partialKVP, paramsKVP);

  return partialKVP;
}

function getPartialKVP(kvp, options) {
  var partial = exports.resolvePartial(kvp, options);
  if(!partial) return;

  // Allow YAML partial to redefine the key.
  // This is necessary in order to allow a partial to defer to another partial.

  let props = Object.getOwnPropertyNames(partial.value);
  if(props.length === 1 && !inlineParameterPattern.test(props[0])) {
    let key = props[0].replace(/~.*$/, "");
    if(getMetadata(key).key === undefined) {
      partial.key = partial.key ? partial.key + props[0] : props[0];
      partial.value = partial.value[props[0]];
    }
  }

  return applyParameters(partial, kvp);
}

function normalizeToObjectAndAddCommonParameters(kvp) {
  var meta = getMetadata(kvp);
  kvp.key = meta.src.key.replace(/>.*/, "");

  if(kvp.value === null || kvp.value === undefined) {
    kvp.value = {};
  } else if(Array.isArray(kvp.value) || typeof kvp.value !== "object") {
    let valueKey = "value";

    // If the data-bound parameter is text or an array, it
    // should be bound to the value, not, for example, the spec/value pair.
    let valueTemplates = ["<", "=", "@"];
    if(meta.template && valueTemplates.indexOf(meta.template.symbol) > -1) {
      let boundVariable = meta.template.variable.replace(/>.*/, "") || meta.key;
      valueKey += meta.template.symbol + boundVariable;
    }

    let originalValue = kvp.value;
    kvp.value = {};
    kvp.value[valueKey] = originalValue;
  }

  kvp.value.partial = meta.partial;
  kvp.value.key = meta.key;
  kvp.value.template = meta.template;

  return kvp;
}

function getPartial(kvp, options) {
  // kvp = Object.assign({}, kvp);
  options = options || {};
  kvp = normalizeToObjectAndAddCommonParameters(kvp);

  var result = getPartialKVP(kvp, options);
  if(!result) return;

  if(isPartial(result)) {
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
