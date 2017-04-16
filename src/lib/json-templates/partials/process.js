"use strict";

const traverse = require("traverse");
const keep = /^([^~]+)~$/;
const replace = /^~([^~]+)$/;
const conditional = /^([^?]+)\?(.*)$/;
const types = require("../../../types");

function replacePlaceholderValue(partial, partialKey, parameters, parametersKey, newKey) {
  if (parameters && (parametersKey === "" || parameters[parametersKey])) {
    partial[newKey] = parameters[parametersKey];
    delete parameters[parametersKey];
  } else if (partial[partialKey]) {
    partial[newKey] = partial[partialKey];
  }
}

function findPlaceholders(keys) {
  let placeholders = keys.reduce((acc, key) => {
    let placeholder = { key: key, keep: keep.exec(key), replace: replace.exec(key), conditional: conditional.exec(key) };
    if (placeholder.replace) placeholder.replace.wildcard = placeholder.replace[1] === "*";
    if (placeholder.keep || placeholder.replace || placeholder.conditional) acc.push(placeholder);
    return acc;
  }, []);

  return placeholders.sort((a, b) => { //conditional, then exact, then part name match. Wildcard last
    if (a.conditional && b.conditional) return 0;
    if (a.conditional && !b.conditional) return -1;
    if (b.conditional && !a.conditional) return 1;
    if (a.keep && b.keep) return 0;
    if (a.keep && !b.keep) return -1;
    if (b.keep && !a.keep) return 1;
    if (a.replace.wildcard && !b.replace.wildcard) return -1;
    if (b.replace.wildcard && !a.replace.wildcard) return 1;
    return 0;
  });
}

function processPartial(partial, parameters) {
  let result = traverse(partial).map(function (value) {
    if (!this.keys) return;

    let placeholders = findPlaceholders(this.keys);
    if (placeholders.length === 0) return;

    let conditionals = {};

    placeholders.forEach(placeholder => {
      if (placeholder.keep) {
        let key = placeholder.keep[1];
        replacePlaceholderValue(value, placeholder.key, parameters, key, key);
      }
      if (placeholder.replace) {
        let match = placeholder.replace[1];
        let wildcard = placeholder.replace.wildcard;
        if (wildcard && !types.isObject(parameters)) {
          value[""] = parameters; //this is taking advantage of the fact that objects that have no keys
          //don't write the starting or ending braces. So these two representations are equal
          // { value: "string" }  { value: { "": "string" } }
        } else if (parameters) {
          Object.keys(parameters).forEach(key => {
            if (wildcard || key.startsWith(match)) {
              let newKey = wildcard ? key : key.replace(match, "");
              replacePlaceholderValue(value, placeholder.key, parameters, key, newKey);
            }
          });
        }
      }
      if (placeholder.conditional) {
        let partialKey = placeholder.conditional[1];
        let parameterKey = placeholder.conditional[2] || placeholder.conditional[1];
        if (types.isObject(parameters) && Object.keys(parameters).find(key => key === parameterKey)) {
          if (parameterKey !== partialKey) { //parameter exists so copy partial value (e.g. spec.labeledBy?label)
            conditionals[partialKey] = value[placeholder.key];
          } else { //move and consume parameter
            conditionals[partialKey] = parameters[parameterKey];
            delete parameters[parameterKey];
          }
        }
      }
      delete value[placeholder.key];
    });
    this.update(Object.assign(conditionals, value));
  });
  return result;
}

exports.process = processPartial;
exports.findPlaceholders = findPlaceholders;
