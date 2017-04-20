"use strict";

const traverse = require("traverse");
const partialKey = require("./partial-key");
const types = require("../../../types");
const emptyKey = "";

function getPartialKeys(sourceKeys) {
  return sourceKeys.map(partialKey.parse)
    .sort((a, b) => {
      if (a.wildcard) return 1;
      if (b.wildcard) return -1;
      return 0;
    });
}

function processPartial(partial, parameters) {
  return traverse(partial).map(function (value) {
    if (!this.keys || types.isArray(value)) return;

    let partialKeys = getPartialKeys(this.keys);
    if (partialKeys.length === 0) return;

    let result = {};

    partialKeys.forEach(partialKey => {
      if (!partialKey.variable) {
        result[partialKey.source] = value[partialKey.source];
        return;
      }
      if (partialKey.wildcard) {
        if (!types.isObject(parameters)) {
          result[emptyKey] = parameters;
          return;
        } else {
          Object.keys(parameters).forEach(key => {
            result[key] = parameters[key];
          });
        }
      } else {
        if (types.isObject(parameters) && Object.keys(parameters).includes(partialKey.variable)) {
          result[partialKey.name] = parameters[partialKey.variable];
          delete parameters[partialKey.variable];
        } else {
          result[partialKey.name] = value[partialKey.source];
        }
      }
    });
    this.update(result);
  });
}

exports.process = processPartial;
