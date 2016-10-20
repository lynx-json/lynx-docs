var util = require("util");

function applyKeyName(key, meta) {
  if (!key) return;
  // key, key@, key#, key^, key@foo, key#foo, should all yield 'key'
  var keyPattern = /^([a-zA-Z]*)($|[@#\^>](.*)$)/;
  var match = keyPattern.exec(key);
  if (match && match[1]) {
    meta.key = match[1];
  }
}

function getSectionName(key) {
  var keyPattern = /^([a-zA-Z]*)($|([@#\^])(.*)$)/;
  var match = keyPattern.exec(key);
  if (!match) throw new Error("Unable to parse key: " + key);
  return match[3] + (match[4] || match[1]);
}

var objectTemplatePattern = /#|\^/;
function isObjectTemplate(key) {
  return objectTemplatePattern.test(key);
}

var arrayTemplatePattern = /@/;
function isArrayTemplate(key) {
  return arrayTemplatePattern.test(key);
}

function applyTemplateMeta(key, meta) {
  if (isObjectTemplate(key)) {
    meta.template = { type: "object" };
  } else if (isArrayTemplate(key)) {
    meta.template = { type: "array" };
  }

  if (meta.template) {
    meta.template.section = getSectionName(key);
  }
}

function applyObjectMeta(value, meta) {
  if (!util.isObject(value) || util.isArray(value)) return;
  
  meta.children = {};
  
  Object.getOwnPropertyNames(value).forEach(function (childKey) {
    var childMeta = getMetadata(childKey);
    
    if (!meta.children[childMeta.key]) {
      meta.children[childMeta.key] = [];    
    }
    
    meta.children[childMeta.key].push(childMeta);
  });
}

function getMetadata(kvp) {
  if (!kvp) throw new Error("'kvp' param is required");
  if (util.isArray(kvp)) throw new Error("'kvp' param cannot be an array");
  if (!util.isObject(kvp)) kvp = { key: kvp.toString() };
  
  var meta = { src: kvp };
  applyKeyName(kvp.key, meta);
  applyTemplateMeta(kvp.key, meta);
  applyObjectMeta(kvp.value, meta);
  
  return meta;
}

module.exports = exports = getMetadata;