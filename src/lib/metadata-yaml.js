"use strict";

var util = require("util");

function applyKeyName(key, meta) {
  if (!key) return;
  // key, key@, key#, key^, key<, key@foo, key#foo, key^foo, key<foo, should all yield 'key'
  var keyPattern = /^([a-zA-Z.]*)($|[@#\^><=](.*)$)/;
  var match = keyPattern.exec(key);
  if (match && match[1]) {
    meta.key = match[1];
  }
}

function getTemplateSectionName(key) {
  var keyPattern = /^([a-zA-Z]*)($|([@#\^<=])(.*)$)/;
  var match = keyPattern.exec(key);
  if (!match) throw new Error("Unable to parse key: " + key);
  return match[3] + (match[4] || match[1]);
}

function getTemplateVariableName(key) {
  var keyPattern = /^([a-zA-Z]*)($|([@#\^<=])(.*)$)/;
  var match = keyPattern.exec(key);
  if (!match) throw new Error("Unable to parse key: " + key);
  return match[4] || match[1];
}

var objectTemplatePattern = /#/;
var inverseObjectTemplatePattern = /\^/;
var arrayTemplatePattern = /@/;
var literalTemplatePattern = /=/;
var literalQuotedTemplatePattern = /</;

function applyTemplateMeta(key, meta) {
  if (!key || !util.isString(key)) return;
  
  if (key.match(objectTemplatePattern)) {
    meta.template = { type: "object", symbol: "#" };
  } else if (key.match(inverseObjectTemplatePattern)) {
    meta.template = { type: "object", symbol: "^" };
  } else if (key.match(arrayTemplatePattern)) {
    meta.template = { type: "array", symbol: "@" };
  } else if (key.match(literalTemplatePattern)) {
    meta.template = { type: "literal", symbol: "=" };
  } else if (key.match(literalQuotedTemplatePattern)) {
    meta.template = { type: "literal", quoted: true, symbol: "<" };
  }

  if (meta.template) {
    meta.template.section = getTemplateSectionName(key);
    meta.template.variable = getTemplateVariableName(key);
  }
}

function applyObjectMeta(value, meta) {
  if (!util.isObject(value) || util.isArray(value)) return;
  
  meta.children = {};
  meta.countOfChildren = 0;
  
  Object.getOwnPropertyNames(value).forEach(function (childKey) {
    if (!childKey) return; //TODO: Figure out why we're getting an empty key and blowing up.
    
    var childMeta = getMetadata(childKey);
    
    if (!meta.children[childMeta.key]) {
      meta.children[childMeta.key] = [];
      meta.countOfChildren++;
    }
    
    childMeta.more = function () {
      return getMetadata({ key: childKey, value: value[childKey] });
    };
    
    meta.children[childMeta.key].push(childMeta);
  });
}

function applyPartialMeta(key, meta) {
  var keyPattern = /^.*>(.*)?$/;
  var match = keyPattern.exec(key);
  if (!match) return;
  meta.partial = match[1] || meta.key;
}

function getMetadata(kvp) {
  if (!kvp) throw new Error("'kvp' param is required");
  if (util.isArray(kvp)) throw new Error("'kvp' param cannot be an array");
  if (!util.isObject(kvp)) kvp = { key: kvp.toString() };
  
  var meta = { src: kvp };
  applyKeyName(kvp.key, meta);
  applyTemplateMeta(kvp.key, meta);
  applyObjectMeta(kvp.value, meta);
  applyPartialMeta(kvp.key, meta);
  
  return meta;
}

module.exports = exports = getMetadata;
