"use strict";

const types = require("../../types");
const templateKeySection = /([@#\^><=]){0,1}([a-zA-Z0-9.\-~*:\/]*)/g;
const partialKeySection = /([@#\^><=~]){0,1}([a-zA-Z0-9.\-*:\/]*)/g;

function parse(key, partialSyntax) {
  // key, key@, key#, key^, key<, key@foo, key#foo, key^foo, key<foo, should all yield 'key'
  if (types.isNumber(key)) return { name: key };
  if (!types.isString(key)) throw Error("key must be a number or a string");

  let expression = partialSyntax ? partialKeySection : templateKeySection;
  let parsed = { source: key };
  let match;
  while ((match = expression.exec(key)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === expression.lastIndex) expression.lastIndex++;

    if (match.index === 0 && !match[1]) parsed.name = match[2]; //key name doesn't have tokens
    else {
      if (match[1]) { //if we have a template token then push the template info
        let result = { token: match[1], variable: match[2] || parsed.name, explicit: !!match[2] };
        if (!result.variable) throw Error("Token must have explicit variable if 'name' does not exist.");
        if (exports.partialToken === result.token) parsed.partial = result;
        else if (exports.placeHolderToken === result.token) parsed.placeholder = result;
        else parsed.binding = result;
      }
    }
  }
  if (!parsed.partial && !parsed.binding && !parsed.name) parsed.empty = true;
  if (parsed.empty && parsed.name !== key) throw Error("'" + key + "' is not a valid key.");
  return parsed;
}

exports.parse = parse;
exports.simpleQuotedToken = "<";
exports.simpleUnquotedToken = "=";
exports.positiveSectionToken = "#";
exports.negativeSectionToken = "^";
exports.iteratorToken = "@";
exports.partialToken = ">";
exports.placeHolderToken = "~";
exports.simpleTokens = ["<", "="];
exports.sectionTokens = ["#", "^"];
exports.allTokens = ["<", "=", "#", "^", "@", ">"];
