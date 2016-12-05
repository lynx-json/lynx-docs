"use strict";

const util = require("util");
const getMetadata = require("../../metadata-yaml");

var templateExporters = {
  literal: exportLiteralTemplate,
  object: exportObjectTemplate,
  array: exportArrayTemplate
};

function resolveValue(kvmp) {
  return kvmp.value !== undefined ? kvmp.value : kvmp.metas[0].src.value;
}

function getKVP(yaml) {
  if(!util.isObject(yaml)) return { key: undefined, value: yaml };

  var props = Object.getOwnPropertyNames(yaml);

  if(props.length === 1 && getMetadata(props[0]).key === undefined) {
    return {
      key: props[0],
      value: yaml[props[0]]
    };
  }

  return { key: undefined, value: yaml };
}

function exportLiteralTemplate(kvmp, cb) {
  function exportTemplate(meta, defaultValue) {
    cb("{{#if " + meta.template.variable + "}}");
    if(meta.template.quoted) cb('"');
    cb("{{" + meta.template.variable + "}}");
    if(meta.template.quoted) cb('"');
    if(defaultValue !== undefined) {
      cb("{{else}}");
      cb(JSON.stringify(defaultValue));
    }
    cb("{{/if}}");
  }

  if(kvmp.metas.length === 1) {
    var defaultValue = resolveValue(kvmp);
    exportTemplate(kvmp.metas[0], defaultValue);
  } else {
    kvmp.metas.forEach(meta => exportTemplate(meta));
  }
}

function exportObjectTemplate(kvmp, cb) {
  function exportTemplate(meta, fallback) {
    var sectionTag = meta.template.section[0];
    var inverseTag = sectionTag === "#" ? "^" : "#";
    cb("{{" + sectionTag + "with " + meta.template.variable + "}}");
    exportObject({ key: kvmp.key, metas: [meta] }, cb);
    cb("{{/with}}");
    if(fallback) {
      cb("{{" + inverseTag + "with " + meta.template.variable + "}}null{{/with}}");
    }
  }

  if(kvmp.metas.length === 1) {
    var meta = kvmp.metas[0];
    exportTemplate(meta, true);
  } else {
    kvmp.metas.forEach(meta => exportTemplate(meta));
  }
}

function exportArrayTemplate(kvmp, cb) {
  var meta = kvmp.metas[0];
  cb("[");
  cb("{{#each " + meta.template.variable + "}}");
  meta.src.value.forEach(function (itemTemplate) {
    var itemTemplateKVP = getKVP(itemTemplate);
    exportHandlebars(itemTemplateKVP, cb);
  });
  cb("{{#unless @last}},{{/unless}}");
  cb("{{/each}}");
  cb("]");
}

function exportTemplate(kvmp, cb) {
  var type = kvmp.metas[0].template.type;
  templateExporters[type](kvmp, cb);
}

function expandMetadata(meta) {
  return meta.more();
}

function exportObject(kvmp, cb) {
  var meta = kvmp.metas[0];

  cb("{");

  var count = 0;
  for(let childKey in meta.children) {
    count++;
    let metas = meta.children[childKey].map(expandMetadata);
    let childKvmp = { key: childKey, metas: metas };
    exportHandlebars(childKvmp, cb);
    if(count !== meta.countOfChildren) cb(",");
  }

  cb(" }");
}

function exportArray(kvmp, cb) {
  var meta = kvmp.metas[0];

  cb("[");

  var length = meta.src.value.length;
  meta.src.value.forEach((child, index) => {
    let childKvmp = getKVP(child);
    exportHandlebars(childKvmp, cb);
    if(index + 1 !== length) cb(",");
  });

  cb("]");
}

function exportHandlebars(kvmp, cb) {
  if(!kvmp.metas) {
    var meta = getMetadata(kvmp);
    kvmp.metas = [meta];
  }

  if(kvmp.metas[0].key) {
    cb(JSON.stringify(kvmp.metas[0].key) + ":");
  }

  var value = resolveValue(kvmp);

  if(kvmp.metas[0].template) {
    exportTemplate(kvmp, cb);
  } else if(util.isObject(value) && !util.isArray(value)) {
    exportObject(kvmp, cb);
  } else if(util.isArray(value)) {
    exportArray(kvmp, cb);
  } else {
    cb(JSON.stringify(value));
  }
}

function kvpToHandlebars(kvp) {
  var buffer = "";
  exportHandlebars(kvp, data => buffer += data);
  return buffer;
}

module.exports = exports = kvpToHandlebars;
