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

function processPlaceholders(traverseNode, placeholderKeys, parameters, used) {
  return function () {
    let value = traverseNode.node;
    let result = Object.keys(value).reduce((acc, key) => {
      let placeholderKey = placeholderKeys.find(p => p.source === key);
      if (placeholderKey) {
        let pairs = getPairsForPlaceholder(placeholderKey, parameters);
        if (!pairs) { //use value in partial
          let placeholder = placeholderKey.placeholder;
          let newKey = placeholderKey.source.replace(placeholder.token + (placeholder.explicit ? placeholder.variable : ''), '');
          setValue(acc, newKey, value[placeholderKey.source]);
        } else {
          //use value in parameters set
          pairs.forEach(pair => {
            acc[pair.key] = pair.value;
            used.push(pair.key);
          });
        }
      } else {
        setValue(acc, key, value[key]); //use value in partial
      }
      return acc;
    }, {});
    traverseNode.update(result);
  };
}

function getPairsForPlaceholder(placeholderKey, parameters) {
  let placeholder = placeholderKey.placeholder;
  if (placeholder.wildcard) {
    if (!types.isObject(parameters)) {
      return [{ key: exports.keyForNonObjectParameters, value: parameters }]; //place non object parameter in a key instead of copying keys
    } else {
      return Object.keys(parameters).map(key => {
        return { key: key, value: parameters[key] };
      });
    }
  } else {
    if (!types.isObject(parameters)) return null;
    let match = Object.keys(parameters).map(templateKey.parse).find(key => key.name === placeholder.variable);
    if (!match) return null;
    let key = placeholderKey.name === match.name ? match.source : placeholderKey.name;
    return [{ key, value: parameters[match.source] }];
  }
}

function applyParameters(partial, parameters) {
  let wildcardFn = null;
  let used = [];
  return traverse(partial).forEach(function (value) {
    if (this.isRoot) {
      this.after(function () {
        if (wildcardFn !== null) {
          used.forEach(key => delete parameters[key]);
          wildcardFn();
        }
      });
    }

    if (!this.keys || types.isArray(value)) return;
    let placeholderKeys = this.keys.map(partialKey.parse).filter(key => !!key.placeholder);
    if (placeholderKeys.length > 0) {
      if (placeholderKeys.find(p => p.placeholder.wildcard)) {
        wildcardFn = processPlaceholders(this, placeholderKeys, parameters, used);
      } else processPlaceholders(this, placeholderKeys, parameters, used)();
    }
  });
}

module.exports = exports = applyParameters;
exports.keyForNonObjectParameters = "";
