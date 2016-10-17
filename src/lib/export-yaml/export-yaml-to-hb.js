var util = require("util");
var getMeta = require("./meta-yaml");

function exportArrayTemplate(value, cb, key) {
  cb("[");
  var meta = getMeta(key);
  cb(" {{#" + meta.template.section + "}} ");
  exportObject(value, cb, key);
  cb("{{#unless @last}},{{/unless}}");
  cb(" {{/" + meta.template.section + "}} ");
  cb("]");
}

function exportObjectTemplate(value, cb, key) {
  var meta = getMeta(key);
  cb(" {{#" + meta.template.section + "}} ");
  cb("{");
  var properties = Object.getOwnPropertyNames(value);
  var lastIndex = properties.length - 1;
  properties.forEach(function (childKey, index) {
    exportYaml(value[childKey], cb, childKey);
    if (index !== lastIndex) {
      cb(",");
    }
  });
  cb("}");
  cb(" {{/" + meta.template.section + "}} ");
}

function exportArray(value, cb, key) {
  cb("[");
  var lastKey = value.length - 1;
  value.forEach(function (childValue, childKey) {
    exportYaml(childValue, cb);
    if (childKey !== lastKey) {
      cb(",");
    }
  });
  cb("]");
}

function exportObject(value, cb, key) {
  cb("{");
  var properties = Object.getOwnPropertyNames(value);
  var lastIndex = properties.length - 1;
  properties.forEach(function (childKey, index) {
    exportYaml(value[childKey], cb, childKey);
    if (index !== lastIndex) {
      cb(",");
    }
  });
  cb("}");
}

function exportSimpleValue(value, cb, key) {
  cb(JSON.stringify(value));
}

function exportYaml(value, cb, key) {
  var meta = getMeta(key);

  if (meta.key) {
    cb(JSON.stringify(meta.key) + ":");
  }

  if (meta.template && meta.template.type === "array") {
    exportArrayTemplate(value, cb, key);
  } else if (meta.template && meta.template.type === "object") {
    exportObjectTemplate(value, cb, key);
  } else if (util.isArray(value)) {
    exportArray(value, cb, key);
  } else if (util.isObject(value)) {
    exportObject(value, cb, key);
  } else {
    exportSimpleValue(value, cb, key);
  }
}

module.exports = exports = exportYaml;
