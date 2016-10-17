"use strict";

const fs = require("fs");
const YAML = require("yamljs");
const path = require("path");
const partialKeyPattern = /^.*>(.*)?$/;

exports.isPartial = function (value, key) {
  return partialKeyPattern.test(key);
};

function fileExists(location) {
  try {
    return fs.statSync(location).isFile();
  } catch (e) {
    return false;
  }
}

function getPartialValue(value, key) {
  function findAndLoadPartial() {
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

  var partial = findAndLoadPartial();
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

exports.getPartial = function (value, key) {
  if (typeof value === "string") value = { partial: value };

  var match = partialKeyPattern.exec(key);
  if (match[1]) value.partial = match[1];

  var key = key.replace(/>.*$/, "");

  return getPartialValue(value, key);
};
