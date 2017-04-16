"use strict";

const url = require("url");
const traverse = require("traverse");
const keyMetadata = require("../key-metadata");
const expandTemplates = require("../expand-templates");
const types = require("../../../types");

function calculatePartialUrl(templatePath, partialName) {
  if (!partialName) throw Error("partialName is required to calculate a partialUrl");
  if (!templatePath) templatePath = process.cwd(); //assume cwd() if no path provided.
  let parsed = url.parse(templatePath, true);
  parsed.query = { partial: partialName };
  return url.format(parsed);
}

function expandPartials(template, resolvePartial, templatePath) {
  let expanded = traverse(template).map(function (value) {
    if (!this.keys || types.isArray(value)) return; //no keys that contain partial references

    //need to create the functions outside the while loop
    let parseKey = (key) => keyMetadata.parse(key);
    let processPartialMeta = (meta, parameters) => {
      let partialUrl = exports.calculatePartialUrl(templatePath, meta.partial.variable);
      let processPartial = resolvePartial(partialUrl);
      let partial = processPartial(parameters);
      return expandTemplates(partial, null, true)
    };

    let result = Object.assign({}, value);
    let keys = this.keys;
    while (keys) { //while loop is necessary in case partial returns references to other partials
      let metas = keys.map(parseKey);
      let partialMetas = metas.filter(meta => !!meta.partial);
      if (partialMetas.length === 0) return;

      partialMetas.forEach((meta) => {
        if (meta.name) throw Error("Template needs be expanded using 'expand-templates' module for expanding partials.");
        var processed = processPartialMeta(meta, result[meta.source]);
        if (types.isObject(processed)) {
          Object.assign(result, processed);
          delete result[meta.source];
        } else {
          result = processed;
        }
      });
      this.update(result);
      if (!types.isObject(result)) return;
      keys = Object.keys(result);
    }
  });
  return expanded;
}

exports.expand = expandPartials;
exports.calculatePartialUrl = calculatePartialUrl;
