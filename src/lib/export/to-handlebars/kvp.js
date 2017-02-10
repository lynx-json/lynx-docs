"use strict";

const util = require("util");
const getMetadata = require("../../metadata-yaml");

function exportObject(meta, cb, options) {
  var propertyNames = Object.getOwnPropertyNames(meta.children);
  var len = propertyNames.length;
  
  cb("{");
  propertyNames.forEach((ckey, idx) => {
    let cmeta = meta.children[ckey];
    if (cmeta.more) cmeta = cmeta.more();
    exportHandlebars(cmeta, cb);
    if (idx + 1 !== len) cb(",");
  });
  cb(" }");
}

function exportArray(meta, cb) {
  var kvp = meta.src;
  var len = kvp.value.length;
  
  cb("[");
  kvp.value.forEach((val, idx) => {
    let ckvp = { value: val };
    exportHandlebars(getMetadata(ckvp), cb);
    if (idx + 1 !== len) cb(",");
  });
  cb("]");
}

function exportLiteralTemplate(meta, cb, options) {
  cb("{{#if " + meta.template.variable + "}}");
  
  if(meta.template.quoted) cb('"');
  cb("{{" + meta.template.variable + "}}");
  if(meta.template.quoted) cb('"');
  
  if(!options.noDefault) {
    var defaultValue = meta.src.value;
    cb("{{else}}");
    cb(JSON.stringify(defaultValue));
  }
  
  cb("{{/if}}");
}

function getInverseObjectTemplate(template) {
  var inverseSymbol = template.symbol === "#" ? "^" : "#";
  var inverseSection = template.section.replace(template.symbol, inverseSymbol);
  return {
    type: "object",
    symbol: inverseSymbol,
    section: inverseSection,
    variable: template.variable
  };
}

function exportObjectTemplate(meta, cb, options) {
  cb("{{" + meta.template.section + "}}");
  exportObject(meta, cb);
  cb("{{/" + meta.template.variable + "}}");
  
  if (!options.noDefault) {
    var defaultValue = meta.key === "value" ? null : emptyVsp();
    var inverse = getInverseObjectTemplate(meta.template);
    cb("{{" + inverse.section + "}}");
    cb(JSON.stringify(defaultValue));
    cb("{{/" + inverse.variable + "}}");
  }
}

function emptyVsp() {
  return {
    spec: {
      hints: [ "container" ]
    },
    value: null
  };
}

function exportArrayTemplate(meta, cb, options) {
  cb("[");
  cb("{{#each " + meta.template.variable + "}}");
  meta.src.value.forEach(itemTemplate => {
    let ckvp = { value: itemTemplate };
    let cmeta = getMetadata(ckvp);
    exportHandlebars(cmeta, cb);
  });
  cb("{{#unless @last}},{{/unless}}");
  cb("{{/each}}");
  cb("]");
}

function exportHandlebars(meta, cb, options) {
  options = options || {};
  
  if(meta.key && !options.noKey) {
    cb(JSON.stringify(meta.key) + ":");
  }
  
  if (meta.templates) {
    let len = meta.templates.length;
    
    meta.templates.forEach((cmeta, idx) => {
      let coptions = {};
      
      if (len > 1) {
        coptions.noDefault = true;
      }
      
      if (idx > 0) {
        coptions.noKey = true;
      }
      
      exportHandlebars(cmeta, cb, coptions);
    });
  } else if (meta.template && meta.template.type === "literal") {
    exportLiteralTemplate(meta, cb, options);
  } else if (meta.template && meta.template.type === "object") {
    exportObjectTemplate(meta, cb, options);
  } else if (meta.template && meta.template.type === "array") {
    exportArrayTemplate(meta, cb, options);
  } else if (util.isPrimitive(meta.src.value)) {
    cb(JSON.stringify(meta.src.value));
  } else if (Array.isArray(meta.src.value)) {
    exportArray(meta, cb);
  } else if (meta.children) {
    exportObject(meta, cb);
  }
}

function kvpToHandlebars(kvp) {
  var buffer = "";
  var meta = getMetadata(kvp);
  exportHandlebars(meta, data => buffer += data);
  return buffer;
}

module.exports = exports = kvpToHandlebars;
