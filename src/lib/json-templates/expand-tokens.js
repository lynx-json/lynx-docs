"use strict";

const traverse = require("traverse");
const keyMetadata = require("./key-metadata");
const types = require("../../types");

function isInverseInferenceAllowed(metas) {
  let nameBindings = metas.reduce((acc, meta) => {
    if (!meta.binding) return acc;
    if (!acc[meta.name]) acc[meta.name] = [];
    acc[meta.name].push(meta.binding);
    return acc;
  }, {});

  return Object.keys(nameBindings).every(name => {
    let bindings = nameBindings[name];
    var variable = bindings[0].variable;
    return bindings.every(binding => binding.variable === variable);
  });
}

function convertMeta(meta, keys, value) {
  return Object.assign({}, meta, { value: value, keys: keys });
}

function addInverseSections(metas) {
  metas.reduce((inverseMetas, meta) => {
      if (!meta.binding || !keyMetadata.sectionTokens.includes(meta.binding.token)) return inverseMetas;
      let inverseExists = metas.find(candidate => candidate !== meta &&
        candidate.binding && candidate.binding.variable === meta.binding.variable);
      if (inverseExists) return inverseMetas;

      let inverseToken = keyMetadata.sectionTokens.find(token => token !== meta.binding.token);
      let keys = meta.keys.reduce((inverseKeys, key) => {
        if (key === meta.binding.token + meta.binding.variable) inverseKeys.push(inverseToken + meta.binding.variable);
        else inverseKeys.push(key);
        return inverseKeys;
      }, []);
      inverseMetas.push(convertMeta(meta, keys, null));
      return inverseMetas;
    }, [])
    .forEach(inverseMeta => {
      metas.push(inverseMeta);
    });
}

function convertForExpansion(metas, sourceValue, inferInverseTokenValues) {
  let converted = metas.reduce((accumulator, meta) => {
    accumulator.push(convertMeta(meta, [], sourceValue[meta.source]));
    return accumulator;
  }, []);

  converted.forEach(item => {
    function pushTemplateKey(template) {
      return item.keys.push(template.token + template.variable);
    }
    if (item.name) item.keys.push(item.name);

    if (item.binding &&
      item.binding.token === keyMetadata.iteratorToken) { //always put iterator ahead of parital
      if (item.binding) pushTemplateKey(item.binding);
      if (item.partial) pushTemplateKey(item.partial);
      return;
    }

    let matching = converted.filter(candidate => candidate !== item &&
      candidate.name === item.name &&
      candidate.variable === item.variable);

    if (matching.length > 0) { //matching items, push bindings first
      if (item.binding) pushTemplateKey(item.binding);
      if (item.partial) pushTemplateKey(item.partial);
    } else { //no matching items push partials first
      if (item.partial) pushTemplateKey(item.partial);
      if (item.binding) pushTemplateKey(item.binding);
    }
  });

  if (inferInverseTokenValues !== false) addInverseSections(converted);

  return converted;
}

function expandTokens(template, inferInverseTokenValues) {

  return traverse(template).map(function (value) {
    if (!this.keys) return; //nothing to expand. Always true for simple values
    if (types.isArray(value)) return; //arrays are not expanded, only objects in array

    let metas = this.keys.map(keyMetadata.parse);
    let expandMetas = metas.filter(meta => meta.partial || meta.binding);
    if (expandMetas.length === 0) return; //nothing to expand.

    let mixedKeys = expandMetas.length !== this.keys.length && expandMetas.filter(meta => !meta.name).length > 0;
    if (mixedKeys) {
      //TODO: Don't know if we want to throw here or not. There are scenarios where we want mixed keys (document partial)
      //however it may result in invalid documents if the author isn't careful.
      //throw Error("Named and unnamed keys cannot exist in the same object. The keys in error are ['" + this.keys.join("','") + "'].");
    }

    if (inferInverseTokenValues !== false) {
      inferInverseTokenValues = isInverseInferenceAllowed(expandMetas);
    }

    let expanding = {};
    convertForExpansion(expandMetas, value, inferInverseTokenValues).forEach(meta => {
      let context = expanding;
      meta.keys.forEach((key, index) => {
        if (!context[key]) context[key] = {};
        if (index === meta.keys.length - 1) {
          context[key] = meta.value;
          delete value[meta.source];
        }
        context = context[key];
      });
    });

    this.update(Object.assign(value, expanding));
  });
}

exports.expand = expandTokens;
