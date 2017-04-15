"use strict";
const url = require("url");
const traverse = require("traverse");
const keyMetadata = require("../key-metadata");
const expandTemplates = require("../expand-templates");

function calculatePartialUrl(templatePath, partialName) {
  if (!partialName) throw Error("partialName is required to calculate a partialUrl");
  if (!templatePath) templatePath = process.cwd(); //assume cwd() if no path provided.
  var parsed = url.parse(templatePath, true);
  parsed.query = { partial: partialName };
  return url.format(parsed);
}

function expandPartials(condensed, resolvePartial, templatePath) {
  var result = traverse(condensed).map(function (value) {
    if (!this.keys) return;

    let keys = this.keys;

    //need to create the functions outside the while loop
    let parseKey = (key) => keyMetadata.parse(key);
    let processPartialMeta = (meta) => {
      var partialUrl = exports.calculatePartialUrl(templatePath, meta.partial.variable);
      let partialFn = resolvePartial(partialUrl);
      let partial = partialFn(value[meta.source]);
      let pattern = new RegExp(meta.partial.token + "(" + meta.partial.variable + ")?");
      let newKey = meta.source.replace(pattern, "");
      if (!newKey) {
        value = expandTemplates(partial, null, true);
      } else {
        delete value[meta.source];
        value[newKey] = expandTemplates(partial, null, true);
      }
    };

    while (keys) { //while loop is necessary in case partial returns reference to another partial
      let metas = keys.map(parseKey);
      let partialMetas = metas.filter(meta => !!meta.partial);

      if (partialMetas.length === 0) return;
      // if (partialMetas.length > 1) throw Error("Multiple partials encountered. There should only be a single partial. Value must be processed by 'expand-templates' module prior to expanding partials.");

      partialMetas.forEach(processPartialMeta);
      this.update(value);
      keys = Object.keys(value);
    }
  });
  return result;
}

exports.expand = expandPartials;
exports.calculatePartialUrl = calculatePartialUrl;
