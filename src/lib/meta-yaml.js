function getKeyName(key) {
  if (!key) return null;
  // key, key@, key#, key^, key@foo, key#foo, should all yield 'key'
  var keyPattern = /^([a-zA-Z]*)($|[@#\^>](.*)$)/;
  var match = keyPattern.exec(key);
  if (!match) throw new Error("Unable to parse key: " + key);
  return match[1];
}

function getSectionName(key) {
  var keyPattern = /^([a-zA-Z]*)($|[@#\^](.*)$)/;
  var match = keyPattern.exec(key);
  if (!match) throw new Error("Unable to parse key: " + key);
  return match[3] || match[1];
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

module.exports = exports = function getMeta(kvp) {
  if (typeof kvp === "string") kvp = { key: kvp };
  if (typeof kvp === "number") kvp = { key: kvp.toString() };
  var meta = {};
  meta.key = getKeyName(kvp.key);
  applyTemplateMeta(kvp.key, meta);
  return meta;
};
