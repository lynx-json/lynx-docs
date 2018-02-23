"use strict";

const traverse = require("traverse");
const expandTokens = require("../expand-tokens");
const partialKey = require("./partial-key");
const types = require("../../../types");
const emptyKey = "";

function sortPlaceholders(placeholders) {
  placeholders.sort((a, b) => { //partials with wildcard replacements need to processed last
    if (a.keys.some(k => k.placeholder.wildcard)) return 1;
    if (b.keys.some(k => k.placeholder.wildcard)) return -1;
    return 0;
  });
  placeholders.forEach(p =>
    p.keys.sort((a, b) => { //wildcards need to be processed last      
      if (a.placeholder.wildcard) return 1;
      if (b.placeholder.wildcard) return -1;
      return 0;
    }));
}

function processPlaceholders(placeholders, parameters) {
  sortPlaceholders(placeholders);
  placeholders.forEach(level => {
    level.keys.forEach(key => {
      let placeholder = key.placeholder;
      if (placeholder.wildcard) {
        if (!types.isObject(parameters)) {
          level.value[emptyKey] = parameters; //create value template for non-object parameters
        } else {
          Object.keys(parameters).forEach(key => {
            level.value[key] = parameters[key];
            delete parameters[key]; //consume the parameter
          });
        }
      } else {
        if (types.isObject(parameters) && Object.keys(parameters).includes(placeholder.variable)) {
          level.value[key.name] = parameters[placeholder.variable];
          delete parameters[placeholder.variable]; //consume the parameter
        } else { //didn't match in parameters so use default
          level.value[key.name] = level.value[key.source];
        }
      }
      delete level.value[key.source]; //remove the original from the partial
    });
  });
}

function processPartial(partial, parameters) {
  let placeholders = traverse(partial).reduce(function (acc, value) {
    if (!this.keys || types.isArray(value)) return acc;
    let keys = this.keys.map(partialKey.parse).filter(key => !!key.placeholder);
    if (keys.length === 0) return acc;

    acc.push({ keys: keys, value: value });
    return acc;
  }, []);

  processPlaceholders(placeholders, parameters);

  return partial;
}

exports.process = processPartial;
