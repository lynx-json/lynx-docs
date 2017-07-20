"use strict";

const traverse = require("traverse");
const templateKey = require("./template-key");
const validators = require("./validators");
const types = require("../../types");
const log = require("logatim");

function createMetaForExpansion(meta, keys, value) {
  return Object.assign({}, meta, { value: value, keys: keys });
}

function findInverseMeta(metas, reference) {
  return metas.find(candidate => candidate !== reference &&
    candidate.binding && reference.binding && candidate.binding.variable === reference.binding.variable);
}

function convertForExpansion(metas, sourceValue) {
  let converted = metas.map(meta => createMetaForExpansion(meta, [], sourceValue[meta.source]));

  converted.forEach(item => {
    function pushTemplateKey(template) {
      return item.keys.push(template.token + template.variable);
    }
    if (item.name) item.keys.push(item.name);
    if (item.binding && templateKey.simpleTokens.includes(item.binding.token)) {
      if (item.partial) pushTemplateKey(item.partial);
      if (item.binding) pushTemplateKey(item.binding);
    } else {
      //always put section ahead of the partial
      if (item.binding) pushTemplateKey(item.binding);
      if (item.partial) pushTemplateKey(item.partial);
    }
  });

  return converted;
}

function expandTokens(template) {
  return traverse(template).map(function (value) {
    if (!this.keys) return; //nothing to expand. Always true for simple values
    if (types.isArray(value)) return; //arrays are not expanded, only objects in array

    let metas = this.keys.map(templateKey.parse);
    let expandMetas = metas.filter(meta => meta.partial || meta.binding);
    if (expandMetas.length === 0) return; //nothing to expand.

    let validate = validators.validateCompatibleSections(metas);
    if (!validate.valid) log.yellow(validate.message).debug();

    let result = {};
    convertForExpansion(metas, value).forEach(meta => {
      let context = result;
      meta.keys.forEach((key, index) => {
        if (!context[key]) context[key] = {};
        if (index === meta.keys.length - 1) {
          context[key] = meta.value;
        }
        context = context[key];
      });
    });

    this.update(result);
  });
}

exports.expand = expandTokens;
