"use strict";

const url = require("url");
const path = require("path");
const traverse = require("traverse");
const templateKey = require("../template-key");
const expandTokens = require("../expand-tokens");
const types = require("../../../types");

function calculateParentPath(child) {
  if (!child) return child;
  return path.join(child, "../");
}

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
    let searchPath = templatePath;

    //need to create the functions outside the while loop
    let processPartialMeta = (meta) => {
      if (meta.name) throw Error("Template needs to be expanded using 'expand-tokens' module before expanding partials.");
      let partialUrl = exports.calculatePartialUrl(searchPath, meta.partial.variable);
      let processPartial = resolvePartial(partialUrl);
      let partial = processPartial(result[meta.source]);
      let expanded = expandTokens.expand(partial);

      if (types.isObject(expanded)) {
        delete result[meta.source];
        result = Object.assign(expanded, result);
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
      searchPath = calculateParentPath(searchPath);
    }
  });
}

exports.expand = expandPartials;
exports.calculatePartialUrl = calculatePartialUrl;
