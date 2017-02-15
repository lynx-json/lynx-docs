"use strict";

var util = require("util");

function applyKeyName(key, meta) {
  if (key === null || key === undefined) return;
  
  if (typeof key === "number") {
    meta.key = key;
    return;
  }
  
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
  function isTemplateContainer() {
    if (!value) return false;
    if (typeof value !== "object" || Array.isArray(value)) return false;
    var props = Object.getOwnPropertyNames(value);
    return props.length > 0 &&
      props.every(key => {
        var meta = getMetadata(key);
        return !meta.key && !!meta.template;
      });
  }

  function getTemplates() {
    return Object.getOwnPropertyNames(value).map(key => {
      var kvp = { key: key, value: value[key] };
      var meta = getMetadata(kvp);
      return meta;
    });
  }
  
  if (!util.isObject(value) || util.isArray(value)) return;
  
  if (isTemplateContainer()) {
    meta.templates = getTemplates();
    return;
  }
  
  meta.children = {};
  meta.countOfChildren = 0;
  
  Object.getOwnPropertyNames(value)
    .filter(childKey => !!childKey)
    .map(childKey => {
      let childMeta = getMetadata(childKey);
      let childValue = value[childKey];
      
      childMeta.more = function () {
        return getMetadata({ key: childKey, value: childValue });
      };
      
      if (isTemplateContainer(childValue)) {
        childMeta.templates = getTemplates(childValue);
      }
      
      return childMeta;
    })
    .forEach(childMeta => {
      if (childMeta.template) {
        if (childMeta.key in meta.children === false) {
          meta.children[childMeta.key] = { templates: [] };
          meta.countOfChildren++;
        }
        meta.children[childMeta.key].templates.push(childMeta.more());
      } else {
        meta.children[childMeta.key] = childMeta;
        meta.countOfChildren++;
      }
    });
}

function applyPartialMeta(kvp, meta) {
  var keyPattern = /^.*>(.*)?$/;
  var match = keyPattern.exec(kvp.key);
  if (!match) return;
  meta.partial = {
    name: match[1] || meta.key
  };
  
  if (kvp.value) {
    meta.partial.params = kvp.value;
  }
}

function getMetadata(kvp) {
  if (kvp === undefined || kvp === null) throw new Error("'kvp' param is required");
  if (util.isArray(kvp)) throw new Error("'kvp' param cannot be an array");
  if (!util.isObject(kvp)) kvp = { key: kvp.toString() };
  
  var meta = { src: kvp };
  applyKeyName(kvp.key, meta);
  applyTemplateMeta(kvp.key, meta);
  applyObjectMeta(kvp.value, meta);
  applyPartialMeta(kvp, meta);
  
  return meta;
}

module.exports = exports = getMetadata;
