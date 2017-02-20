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

function resolvePartial(meta, options) {
  var partialsFolder = path.join(options.realm.folder, "_partials");
  var partialName = meta.partial.name;

  if(meta.partial.name.startsWith("+")) {
    if(!options.partials.context) throw new Error("Expected a partials.context for resolution of global partial.");
    partialsFolder = path.join(path.dirname(path.dirname(path.dirname(options.partials.context))), "_partials");
    if(partialsFolder.indexOf(process.cwd()) !== 0) partialsFolder = fallbackPartialsFolder;

    partialName = partialName.replace(/^\+/, "");
  }

  while(partialsFolder) {
    let partialFile = path.join(partialsFolder, partialName + ".js");
    if(fs.existsSync(partialFile)) {
      //Since we're using require, the js is cached, so a change
      //will not be loaded unless we clear require cache.
      delete require.cache[require.resolve(partialFile)];
      
      return {
        value: require(partialFile)(meta.partial.params, options),
        location: partialFile
      };
    }

    partialFile = path.join(partialsFolder, partialName + ".yml");

    if(fs.existsSync(partialFile)) {
      let content = fs.readFileSync(partialFile);

      let yaml = parseYaml(content);

      return {
        value: yaml,
        location: partialFile
      };
    }

    if(path.dirname(partialsFolder) === process.cwd()) partialsFolder = fallbackPartialsFolder;
    else if(partialsFolder === fallbackPartialsFolder) partialsFolder = null;
    else partialsFolder = path.join(path.dirname(path.dirname(partialsFolder)), "_partials");
  }
}

function hasValueTemplate(meta) {
  var valueTemplates = ["<", "=", "@"];
  return meta.template && valueTemplates.indexOf(meta.template.symbol) > -1;
}

function* getParams(meta) {
  if (isArrayOrPrimitive(meta.partial.params)) return;
  
  for(let p in meta.partial.params) {
    yield getMetadata({
      key: p,
      value: meta.partial.params[p]
    });
  }
}

function getParam(meta, name) {
  for(let p of getParams(meta)) {
    if(p.key === name) return p;
  }
}

function collectExplicitPlaceholders(partial) {
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

function* replaceWildcardPlaceholders(partialResult, meta, explicitPlaceholders) {
  let pattern = placeholderPattern();

  let match = pattern.exec(partialResult.key);
  if(!match) return;

  let placeholderName = parseParamName(match[2] || match[1]);
  if(placeholderName.name !== "*") return;

  function isMostSpecificPlaceholderFor(param) {
    let match = explicitPlaceholders.find(k => param.key === k.fullName || param.fullName === k.fullName ||
      (param.fullName.startsWith(k.namespace) && k.name === "*") ||
      k.fullName === "*");

    return match && match.fullName === placeholderName.fullName;
  }

  for(let param of getParams(meta)) {
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
function applyConditionalPlaceholders(partialResult, meta) {
  var pattern = conditionalPlaceholderPattern();

  var match = pattern.exec(partialResult.key);
  if(!match) return partialResult;

  var key = match[1];
  var placeholder = match[2];
  var condition = new RegExp(match[3]);
  var matchesCondition = false;
  for(let p of getParams(meta)) {
    if(condition.test(p.key)) {
      matchesCondition = true;
      continue;
    }
  }

  if(!matchesCondition) return null;

  partialResult.key = key;
  if(placeholder) partialResult.key += placeholder;
  return partialResult;
}

function isArrayOrPrimitive(value) {
  return Array.isArray(value) || util.isPrimitive(value);
}

// Explicit placeholders (as opposed to wildcard placeholders)
// are in the form 'key~param'.
function replaceExplicitPlaceholders(partialResult, meta) {
  var pattern = placeholderPattern();

  var match = pattern.exec(partialResult.key);
  if(!match) return partialResult;

  var metaFromPlaceholder = getMetaKeyWithoutPlaceholder(partialResult.key);
  var placeholder = match[2] || match[1];
  
  if (placeholder === "value" && isArrayOrPrimitive(meta.partial.params)) {
    let valueKey = metaFromPlaceholder.src.key;
    
    if (hasValueTemplate(meta)) {
      let boundVariable = meta.template.variable.replace(/>.*/, "") || meta.key;
      valueKey += meta.template.symbol + boundVariable;
      meta.src.key = meta.key;
    }
    
    partialResult.key = valueKey;
    partialResult.value = meta.partial.params;
    
    return partialResult;
  }
  
  var param = getParam(meta, placeholder);
  var newKey = param ? param.src.key : metaFromPlaceholder.src.key;

  if(!param) {
    if(partialResult.value !== null && partialResult.value !== undefined) {
      partialResult.key = newKey;
      return partialResult;
    }

    let newKeyMeta = getMetadata(newKey);
    if(newKeyMeta.template || newKeyMeta.partial) {
      partialResult.key = newKey;
      return partialResult;
    }

    return;
  }

  // The partial key wins, but we need to copy template and partial info from
  // the param key.
  if(param.key !== metaFromPlaceholder.key) {
    newKey = metaFromPlaceholder.key;
    if(param.template) newKey += param.template.section;
    if(param.partial) newKey += ">" + param.partial.name;
  }

  partialResult.key = newKey;
  partialResult.value = param.src.value !== undefined ? param.src.value : null;
  
  return partialResult;
}

function applyParametersToChildrenOfObject(partialResult, meta, explicitPlaceholders) {
  var result = {};

  for(let p in partialResult.value) {
    let partialChildKVP = { key: p, value: partialResult.value[p] };

    let isWildcard = partialChildKVP.key.indexOf("*") !== -1;
    if(isWildcard) {
      for(let r of replaceWildcardPlaceholders(partialChildKVP, meta, explicitPlaceholders)) {
        result[r.key] = r.value;
      }
      continue;
    }

    let childResult = applyParameters(partialChildKVP, meta, explicitPlaceholders);
    if(childResult) result[childResult.key] = childResult.value;
  }

  partialResult.value = result;
  return partialResult;
}

function applyParametersToChildrenOfArray(partialResult, meta, explicitPlaceholders) {
  partialResult.value = partialResult.value.map(item => applyParameters({ value: item }, meta, explicitPlaceholders).value);
  return partialResult;
}

const inlineParameterPattern = /~{{([^}^|]*)(?:\|([^}]*))?}}/g;

// Inline placeholders are for replacing part of a string value. They
// are in the form ~{{param|Default Value}}
function replaceInlinePlaceholders(partialResult, meta) {
  function replace(text) {
    for(var param of getParams(meta)) {
      if(param.src.value === null || param.src.value === undefined) continue;
      let pattern = new RegExp("~{{" + param.key + "(?:\|([^}]*))?}}", "g");
      text = text.replace(pattern, param.src.value);
    }
    
    if (isArrayOrPrimitive(meta.partial.params)) {
      if (meta.partial.params !== null && meta.partial.params !== undefined) {
        let pattern = new RegExp("~{{value(?:\|([^}]*))?}}", "g");
        text = text.replace(pattern, meta.partial.params);
      }
    }

    text = text.replace(inlineParameterPattern, "$2");

    return text;
  }

  if(partialResult.value && (typeof partialResult.value === "string")) {
    partialResult.value = replace(partialResult.value);
  }

  return partialResult;
}

function applyParameters(partialResult, meta, explicitPlaceholders) {
  if(!explicitPlaceholders) explicitPlaceholders = collectExplicitPlaceholders(partialResult);

  if(util.isArray(partialResult.value)) {
    partialResult = applyParametersToChildrenOfArray(partialResult, meta, explicitPlaceholders);
  } else if(util.isObject(partialResult.value)) {
    partialResult = applyParametersToChildrenOfObject(partialResult, meta, explicitPlaceholders);
  }

  partialResult = applyConditionalPlaceholders(partialResult, meta);
  if(!partialResult) return partialResult;

  partialResult = replaceInlinePlaceholders(partialResult, meta);
  
  partialResult = replaceExplicitPlaceholders(partialResult, meta);

  return partialResult;
}

function getPartialResult(kvp, options) {
  var meta = getMetadata(kvp);
  var partialResult = exports.resolvePartial(meta, options);
  console.log("RESOLVED PARTIAL", JSON.stringify(partialResult, null, 2));
  if(!partialResult) return;

  partialResult = applyParameters(partialResult, meta);
  
  // Remove the partial reference from the src key.
  var newKey = meta.src.key ? meta.src.key.replace(/>.*/, "") : undefined;
  
  if (newKey !== null && newKey !== "" && newKey !== undefined) {
    partialResult.key = newKey;
  } else {
    delete partialResult.key;
  }
  
  return partialResult;
}

function getPartial(kvp, options) {
  options = options || {};
  var result = getPartialResult(kvp, options);
  
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

exports.isPartial = isPartial;
exports.getPartial = getPartial;
exports.resolvePartial = resolvePartial;
