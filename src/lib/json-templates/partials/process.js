"use strict";

const traverse = require("traverse");
const expandTokens = require("../expand-tokens");
const partialKey = require("./partial-key");
const types = require("../../../types");
const emptyKey = "";

function processReplacements(replacements, parameters) {
  replacements.forEach(item => {
    let value = item.value;
    item.keys.forEach(partialKey => {
      if (partialKey.wildcard) {
        if (!types.isObject(parameters)) {
          value[emptyKey] = parameters; //create value template for non-object parameters
        } else {
          Object.keys(parameters).forEach(key => {
            value[key] = parameters[key];
            delete parameters[key]; //consume the parameter
          });
        }
      } else {
        if (types.isObject(parameters) && Object.keys(parameters).includes(partialKey.variable)) {
          value[partialKey.name] = parameters[partialKey.variable];
          delete parameters[partialKey.variable]; //consume the parameter
        } else { //didn't match in parameters so use default
          value[partialKey.name] = value[partialKey.source];
        }
      }
      delete value[partialKey.source]; //remove the original from the partial
    });
  });
}

function getPartialKeys(sourceKeys) {
  return sourceKeys.map(partialKey.parse)
    .sort((a, b) => { //wildcards need to be processed last
      if (a.wildcard) return 1;
      if (b.wildcard) return -1;
      return 0;
    });
}

function processPartial(partial, parameters) {
  let replacements = traverse(partial).reduce(function (acc, value) {
    if (!this.keys || types.isArray(value)) return acc;
    let partialKeys = getPartialKeys(this.keys).filter(key => !!key.variable);
    if (partialKeys.length === 0) return acc;

    acc.push({ keys: partialKeys, value: value });
    return acc;
  }, []).sort((a, b) => { //partials with wildcard replacements need to processed last
    if (a.keys.some(k => k.wildcard)) return 1;
    if (b.keys.some(k => k.wildcard)) return -1;
    return 0;
  });

  processReplacements(replacements, parameters);

  return partial;
}

exports.process = processPartial;
