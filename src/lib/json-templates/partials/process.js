"use strict";

const traverse = require("traverse");
const partialKey = require("./partial-key");
const templateKey = require("../template-key");
const types = require("../../../types");

/* the purpose of this method is to handle situations where a partial with a wildcard placeholder
   is called with parameters that share key names with the partial. The value from the parameters should win */
function setValue(object, key, value) {
  if (key in object === true) return;
  object[key] = value;
}

function processPlaceholders(traverseNode, value, placeholderKeys, parameters) {
  return function () {
    let result = Object.keys(value).reduce((acc, key) => {
      let placeholderKey = placeholderKeys.find(p => p.source === key);
      if (placeholderKey) {
        let pairs = getPairsForPlaceholder(placeholderKey.placeholder, parameters);
        if (!pairs) setValue(acc, placeholderKey.name, value[placeholderKey.source]); //value from partial
        else {
          pairs.forEach(pair => acc[pair.key] = pair.value); //value from paramaters
        }
      } else {
        setValue(acc, key, value[key]); //value from partial
      }
      return acc;
    }, {});
    traverseNode.update(result);
  };
}

function getPairsForPlaceholder(placeholder, parameters) {
  if (placeholder.wildcard) {
    if (!types.isObject(parameters)) {
      return [{ key: exports.process.keyForNonObjectParameters, value: parameters }]; //place non object parameter in a key instead of copying keys
    } else {
      return Object.keys(parameters).map(key => {
        let pair = { key: key, value: parameters[key] };
        delete parameters[key]; //consume the parameter
        return pair;
      });
    }
  } else {
    if (!types.isObject(parameters)) return null;
    let match = Object.keys(parameters).map(templateKey.parse).find(key => key.name === placeholder.variable);
    if (!match) return null;
    let pairs = [{ key: match.source, value: parameters[match.source] }];
    delete parameters[match.source]; //consume the parameter
    return pairs;
  }
}

function processPartial(partial, parameters) {
  let wildcardFn = null;
  return traverse(partial).forEach(function (value) {
    if (this.isRoot) {
      this.after(function () { if (wildcardFn !== null) wildcardFn(); /*do wildcard replacement after all others*/ });
    }

    if (!this.keys || types.isArray(value)) return;
    let placeholderKeys = this.keys.map(partialKey.parse).filter(key => !!key.placeholder);
    if (placeholderKeys.length > 0) {
      if (placeholderKeys.find(p => p.placeholder.wildcard)) {
        wildcardFn = processPlaceholders(this, value, placeholderKeys, parameters);
      } else processPlaceholders(this, value, placeholderKeys, parameters)();
    }
  });
}

exports.process = processPartial;
exports.process.keyForNonObjectParameters = "";
