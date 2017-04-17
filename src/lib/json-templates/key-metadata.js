"use strict";

function parse(key) {
  // key, key@, key#, key^, key<, key@foo, key#foo, key^foo, key<foo, should all yield 'key'
  if (key === null) throw new Error("key must have a value");
  if (typeof key === "number") return { name: key };
  if (typeof key !== "string") throw new Error("key must be a number or a string");

  let match, keySection, parsed;
  keySection = /([@#\^><=]){0,1}([a-zA-Z0-9.]*)/g;
  parsed = { source: key };
  while ((match = keySection.exec(key)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === keySection.lastIndex) keySection.lastIndex++;

    if (match.index === 0 && !match[1]) parsed.name = match[2]; //key name doesn't have tokens
    else {
      if (match[1]) { //if we have a template token then push the template info
        let variable = match[2] || parsed.name;
        if (!variable) throw Error("Token must have explicit variable if 'name' does not exist.");
        if (exports.partialToken === match[1]) parsed.partial = { token: match[1], variable: variable };
        else parsed.binding = { token: match[1], variable: variable };
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
exports.simpleTokens = ["<", "="];
exports.sectionTokens = ["#", "^"];
exports.allTokens = ["<", "=", "#", "^", "@", ">"];
