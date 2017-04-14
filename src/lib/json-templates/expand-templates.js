"use strict";

const traverse = require("traverse");
const keyMetadata = require("./key-metadata");

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

function convertForExpansion(metas, sourceValue, inferInverseTemplates) {
  let converted = metas.reduce((accumulator, meta) => {
    accumulator.push(convertMeta(meta, [], sourceValue[meta.source]));
    return accumulator;
  }, []);

  converted.forEach((item, index) => {
    function pushTemplate(template) {
      item.keys.push(template.token + template.variable);
    }
    if (item.name) item.keys.push(item.name);
    if (item.partial) {
      let partialsMatch = converted
        .filter(candidate => candidate !== item && candidate.name === item.name && candidate.variable === item.variable)
        .every(candidate => candidate.partial.variable === item.partial.variable);
      if (partialsMatch) {
        pushTemplate(item.partial);
        if (item.binding) pushTemplate(item.binding);
        return;
      }
    }
    if (item.binding) pushTemplate(item.binding);
    if (item.partial) pushTemplate(item.partial);
  });

  if (inferInverseTemplates !== false) addInverseSections(converted);

  return converted;
}

function expandTemplates(condensed, inferInverseTemplates) {

  return traverse(condensed).map(function (value) {
    if (!this.keys) return; //nothing to expand. Always true for simple values
    if (Array.isArray(value)) return; //arrays are not expanded, only objects in array

    let metas = this.keys.map(key => keyMetadata.parse(key));
    let expandMetas = metas.filter(meta => meta.partial || meta.binding);
    if (expandMetas.length === 0) return; //nothing to expand.

    let invalid = expandMetas.length !== this.keys.length && expandMetas.filter(meta => !meta.name).length > 0;
    if (invalid) throw Error("Named and unnamed keys cannot exist in the same object. The keys in error are ['" + this.keys.join("','") + "'].");

    if (inferInverseTemplates !== false) {
      inferInverseTemplates = isInverseInferenceAllowed(expandMetas);
    }

    let expanding = {};
    convertForExpansion(expandMetas, value, inferInverseTemplates).forEach(meta => {
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

module.exports = exports = expandTemplates;
