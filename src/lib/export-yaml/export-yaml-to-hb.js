"use strict";

const util = require("util");
const getMetadata = require("../metadata-yaml");
const valueTemplateExporters = {
  object: exportObjectValueTemplate,
  array: exportArrayValueTemplate,
  simple: exportSimpleValueTemplate
};

function exportKey(key, cb) {
  cb(JSON.stringify(key) + ":");
}

function exportObjectValueTemplate(metas, cb, options, parent) {
  function exportTemplate(meta) {
    cb("{{" + meta.template.section + "}}");
    var kvp = { 
      key: meta.key, 
      value: parent[meta.src.key]
    };
    exportObject(kvp, cb, options);
    cb("{{/" + meta.template.variable + "}}");
  }
  
  if (metas.length === 1) {
    exportTemplate(metas[0]);
    cb("{{#unless " + metas[0].template.variable + "}}null{{/unless}}");
  } else {
    metas.forEach(exportTemplate);
  }
}

function exportArrayValueTemplate(metas, cb, options, parent) {  
  if (metas.length > 1) throw new Error("Multiple array item templates are not supported.");
  var meta = metas[0];
  var value = parent[meta.src.key];
  
  cb('{"spec":');
  cb(JSON.stringify(value.spec));
  cb(',"value":');
  cb("[");
  cb("{{#each " + meta.template.variable + "}}");
  var kvp = { 
    key: meta.key, 
    value: value.value[0]
  };
  exportObject(kvp, cb, options);
  cb("{{#unless @last}},{{/unless}}");
  cb("{{/each}}");
  cb("]}");
}

function exportSimpleValueTemplate(metas, cb, options, parent) {
  function exportTemplate(meta) {
    cb("{{#if " + meta.template.variable + "}}");
    cb('{"spec":');
    cb(JSON.stringify(meta.more().src.value.spec));
    cb(',"value":');
    cb("{{" + meta.template.variable + "}}");
    cb(" }");
    cb("{{/if}}");
  }
  
  if (metas.length === 1) {
    exportTemplate(metas[0]);
    cb("{{#unless " + metas[0].template.variable + "}}");
    cb('{"spec":');
    cb(JSON.stringify(metas[0].more().src.value.spec));
    cb(',"value":');
    cb(JSON.stringify(metas[0].more().src.value.value));
    cb("}");
    cb("{{/unless}}");
  } else {
    metas.forEach(exportTemplate);
  }
}

function exportValue(metas, cb, options, parent) {
  if (metas.length === 0) throw new Error("No metadata for value.");
  
  if (metas[0].template) {
    // templated value
    valueTemplateExporters[metas[0].template.type](metas, cb, options, parent);
  } else {
    // non-templated value (at this level)
    var key = metas[0].src.key;
    var value = parent[key];
    
    if (util.isArray(value)) {
      exportArray({ key: key, value: value}, cb, options);
    } else if (util.isObject(value)) {
      exportObject({ key: key, value: value}, cb, options);
    } else {
      cb(JSON.stringify(value));  
    }
  }
}

function exportArray(kvp, cb, options) {
  cb("[");
  var length = kvp.value.length;
  kvp.value.forEach(function (val, idx, arr) {
    var meta = getMetadata({ key: idx, value: val });
    exportValue([meta], cb, options, arr);
    if (idx + 1 !== length) cb(",");
  });
  cb("]");
}

function exportObject(kvp, cb, options) {
  var meta = getMetadata(kvp);
  
  cb("{ ");
  var count = 0;
  for (let child in meta.children) {
    count++;
    exportKey(child, cb, options);
    exportValue(meta.children[child], cb, options, kvp.value);
    if (count !== meta.countOfChildren) cb(",");
  }
  cb(" }");
}

function exportKvp(kvp, cb, options) {
  var meta = getMetadata(kvp);
  
  if (!meta.template && util.isObject(kvp.value)) {
    exportObject(kvp, cb, options);
  } else {
    // when exporting Lynx YAML, the root kvp.value should
    // always be an object with a 'spec' and 'value' key.
    // we may support other scenarios here, but not right now.
    throw new Error("Export of the supplied 'kvp' param is not supported.");
  }
}

module.exports = exports = exportKvp;
