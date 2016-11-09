"use strict";

const util = require("util");
const getMetadata = require("../metadata-yaml");

var templateExporters = {
  simple: exportSimpleTemplate,
  object: exportObjectTemplate,
  array: exportArrayTemplate
};

function resolveValue(kvmp) {
  return kvmp.value !== undefined ? kvmp.value : kvmp.metas[0].src.value;
}

function exportSimpleTemplate(kvmp, cb, options) {
  function exportTemplate(meta, defaultValue) {
    cb("{{#if " + meta.template.variable + "}}");
    cb("\"{{" + meta.template.variable + "}}\"");
    if (defaultValue !== undefined) {
      cb("{{else}}");
      cb(JSON.stringify(defaultValue));  
    }
    cb("{{/if}}");
  }
  
  if (kvmp.metas.length === 1) {
    var defaultValue = resolveValue(kvmp);
    exportTemplate(kvmp.metas[0], defaultValue);
  } else {
    kvmp.metas.forEach(meta => exportTemplate(meta));
  }
}

function exportObjectTemplate(kvmp, cb, options) {
  function exportTemplate(meta, fallback) {
    var sectionTag = meta.template.section[0];
    var inverseTag = sectionTag === "#" ? "^" : "#";
    cb("{{" + sectionTag + "with " + meta.template.variable + "}}");
    exportObject({key: kvmp.key, metas: [meta]}, cb, options);
    cb("{{/with}}");
    if (fallback) {
      cb("{{" + inverseTag + "with " + meta.template.variable + "}}null{{/with}}");  
    }
  }
  
  if (kvmp.metas.length === 1) {
    var meta = kvmp.metas[0];
    exportTemplate(meta, true);
  } else {
    kvmp.metas.forEach(meta => exportTemplate(meta));
  }
}

function exportArrayTemplate(kvmp, cb, options) {
  var meta = kvmp.metas[0];
  cb("[");
  cb("{{#each " + meta.template.variable + "}}");
  exportHandlebars({ value: meta.src.value[0] }, cb, options);
  cb("{{#unless @last}},{{/unless}}");
  cb("{{/each}}");
  cb("]");
}

function exportTemplate(kvmp, cb, options) {
  var type = kvmp.metas[0].template.type;
  templateExporters[type](kvmp, cb, options);
}

function expandMetadata(meta) {
  return meta.more();
}

function exportObject(kvmp, cb, options) {
  var meta = kvmp.metas[0];
  
  cb("{");
  
  var count = 0;
  for (let childKey in meta.children) {
    count++;
    let metas = meta.children[childKey].map(expandMetadata);
    let childKvmp = { key: childKey, metas: metas };
    exportHandlebars(childKvmp, cb, options);
    if (count !== meta.countOfChildren) cb(",");
  }
  
  cb(" }");
}

function exportHandlebars(kvmp, cb, options) {
  if (!kvmp.metas) {
    var meta = getMetadata(kvmp);
    kvmp.metas = [meta];
  }
  
  if (kvmp.key) {
    cb(JSON.stringify(kvmp.metas[0].key) + ":");
  }
  
  var value = resolveValue(kvmp);
    
  if (kvmp.metas[0].template) {
    exportTemplate(kvmp, cb, options);
  } else if (util.isObject(value) && !util.isArray(value)) {
    exportObject(kvmp, cb, options);
  } else {
    cb(JSON.stringify(value));  
  }
}

module.exports = exports = exportHandlebars;
