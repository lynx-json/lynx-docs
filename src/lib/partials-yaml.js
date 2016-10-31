"use strict";

const fs = require("fs");
const YAML = require("yamljs");
const path = require("path");
const partialKeyPattern = /^.*>(.*)?$/;

function isPartial(value, key) {
  return partialKeyPattern.test(key);
};

function fileExists(location) {
  try {
    return fs.statSync(location).isFile();
  } catch (e) {
    return false;
  }
}

function resolvePartial(value, key) {
  var location;

  // TODO: Figure out the real location and iterate up to source root until partial is found.
  location = "./_partials/" + value.partial + ".js";
  if (fileExists(location)) {
    return require(location)(value, key);
  }

  location = "./_partials/" + value.partial + ".yml";
  if (fileExists(location)) {
    let content = fs.readFileSync(location).toString();
    return {
      key: key,
      value: YAML.parse(content)
    };
  }
}

function getPartialValue(value, key) {
  var partial = exports.resolvePartial(value, key);
  if (!partial) throw new Error("Failed to find partial " + value.partial);

  // Replace simple parameters.
  var content = YAML.stringify(partial.value);
  content = content.replace(new RegExp("{{{key}}}", "g"), key);
  for (var p in value) {
    let pattern = new RegExp("{{{" + p + "}}}", "g");
    content = content.replace(pattern, value[p]);
  }

  partial.value = YAML.parse(content);
  return partial;
}

function getPartial(value, key) {
  var isExplicitValue = typeof value !== "object" || Array.isArray(value) || value === null;
  if (isExplicitValue) {
    let originalValue = value;
    value = {};
    if (originalValue) value.value = originalValue;
  };

  // If a partial name is specified like this: key>partial-name
  var match = partialKeyPattern.exec(key);
  if (match[1]) value.partial = match[1];
  
  // Otherwise the partial name is assumed to be the key name: partial-name>
  var key = key.replace(/>.*$/, "");
  if (!value.partial) value.partial = key;

  return getPartialValue(value, key);
};

exports.isPartial = isPartial;
exports.getPartial = getPartial;
exports.resolvePartial = resolvePartial;
