const util = require("util");
const traverse = require("traverse");
const keep = /^([^~]+)~$/;
const replace = /^~([^~]+)$/;
const conditional = /^([^?]+)\?(.*)$/;

const getType = (value) => Object.prototype.toString.call(value).slice(8, -1);

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
    if (placeholder.keep || placeholder.replace || placeholder.conditional) acc.push(placeholder);
    return acc;
  }, []);

  return placeholders.sort((a, b) => { //exact match takes precedence over partial match
    if (a.keep && !b.keep) return -1;
    if (b.keep && !a.keep) return 1;
    return 0;
  });
}

function processPartial(partial, parameters) {
  return traverse(partial).map(function (value) {
    if (!this.keys) return;

    let placeholders = findPlaceholders(this.keys);
    if (placeholders.length === 0) return;

    placeholders.forEach(placeholder => {
      if (placeholder.keep) {
        let key = placeholder.keep[1];
        replacePlaceholderValue(value, placeholder.key, parameters, key, key);
      }
      if (placeholder.replace) {
        let match = placeholder.replace[1];
        let wildcard = match === "*";
        if (wildcard && (parameters === null || (getType(parameters) !== "Object"))) {
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
        if (parameters && getType(parameters) === "Object") {
          if (Object.keys(parameters).find(key => key === parameterKey)) {
            value[partialKey] = value[placeholder.key];
          }
        }
      }
      delete value[placeholder.key];
    });
    this.update(value);
  });
}

exports.process = processPartial;
