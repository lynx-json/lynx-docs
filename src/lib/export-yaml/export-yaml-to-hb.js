var util = require("util");
var getMeta = require("./meta-yaml");

function exportArrayTemplate(kvp, cb) {
  var value = kvp.value;
  var key = kvp.key;
  
  cb("[");
  var meta = getMeta(key);
  cb(" {{#" + meta.template.section + "}} ");
  exportObject(value, cb, key);
  cb("{{#unless @last}},{{/unless}}");
  cb(" {{/" + meta.template.section + "}} ");
  cb("]");
}

function exportObjectTemplate(kvp, cb) {
  var value = kvp.value;
  var key = kvp.key;
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

function exportArray(kvp, cb) {
  var value = kvp.value;
  var key = kvp.key;
  
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

function exportObject(kvp, cb) {
  var value = kvp.value;
  var key = kvp.key;
  
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

function exportSimpleValue(kvp, cb) {
  cb(JSON.stringify(kvp.value));
}

function exportYaml(kvp, cb) {
  var value = kvp.value;
  var key = kvp.key;
  
  var meta = getMeta(key);

  if (meta.key) {
    cb(JSON.stringify(meta.key) + ":");
  }

  if (meta.template && meta.template.type === "array") {
    exportArrayTemplate(kvp, cb);
  } else if (meta.template && meta.template.type === "object") {
    exportObjectTemplate(kvp, cb);
  } else if (util.isArray(value)) {
    exportArray(kvp, cb);
  } else if (util.isObject(value)) {
    exportObject(kvp, cb);
  } else {
    exportSimpleValue(kvp, cb);
  }
}

module.exports = exports = exportYaml;
