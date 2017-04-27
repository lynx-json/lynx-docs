"use strict";

const types = require("../../../types");
const keySection = /^([@#\^><=]?[a-zA-Z0-9.\-*:\/]+[@#\^><=]?)(~{0,1})([a-zA-Z0-9.\-*:\/]+)?$/;
const wildcardCar = "*";

function parse(key) {
  // key, key~, key~key should all yield 'key'
  if (types.isNumber(key)) return { name: key };
  if (!types.isString(key)) throw Error("key must be a number or a string");

  let parsed = { source: key };
  let match = keySection.exec(key);

  if (match) {
    parsed.name = match[1];
    if (match[2]) {
      parsed.wildcard = parsed.name === wildcardCar;
      parsed.variable = parsed.wildcard ? parsed.name : match[3] || parsed.name;
    }
  }

  if (!parsed.name) throw Error("'" + key + "' is not a valid partial key.");
  return parsed;
}

exports.parse = parse;
