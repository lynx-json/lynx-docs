"use strict";

const templateKey = require("../template-key");
const wildcardCar = "*";

function parse(key) {
  let parsed = templateKey.parse(key, true);

  if (parsed.placeholder) parsed.placeholder.wildcard = parsed.placeholder.variable === wildcardCar;

  return parsed;
}

exports.parse = parse;
