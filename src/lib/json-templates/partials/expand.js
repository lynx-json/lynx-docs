"use strict";

const url = require("url");
const traverse = require("traverse");
const templateKey = require("../template-key");
const expandTokens = require("../expand-tokens");
const types = require("../../../types");

function calculatePartialUrl(templatePath, partialName) {
  if (!partialName) throw Error("partialName is required to calculate a partialUrl");
  if (!templatePath) templatePath = process.cwd(); //assume cwd() if no path provided.
  let parsed = url.parse(templatePath, true);
  parsed.query = { partial: partialName };
  return url.format(parsed);
}

function expandPartials(template, resolvePartial, templatePath) {
  return traverse(template).map(function (value) {
    if (!this.keys || types.isArray(value)) return; //no keys that contain partial references

    //need to create the functions outside the while loop
    let processPartialMeta = (meta, parameters) => {
      if (meta.name) throw Error("Template needs be expanded using 'expand-tokens' module for expanding partials.");
      let partialUrl = exports.calculatePartialUrl(templatePath, meta.partial.variable);
      let processPartial = resolvePartial(partialUrl);
      let partial = processPartial(result[meta.source]);
      let expanded = expandTokens.expand(partial);

      if (types.isObject(expanded)) {
        delete result[meta.source];
        Object.assign(result, expanded);
      } else {
        result = expanded;
      }
    };

    let result = Object.assign({}, value);
    let keys = this.keys;
    while (keys) { //while loop is necessary in case partial returns references to other partials
      let metas = keys.map(templateKey.parse);
      let partialMetas = metas.filter(meta => !!meta.partial);
      if (partialMetas.length === 0) return;
      partialMetas.forEach(processPartialMeta);
      this.update(result);
      keys = types.isObject(result) && Object.keys(result);
    }
  });
}

exports.expand = expandPartials;
exports.calculatePartialUrl = calculatePartialUrl;
