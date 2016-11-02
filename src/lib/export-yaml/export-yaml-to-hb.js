"use strict";

var util = require("util");
var getMetadata = require("../metadata-yaml");

function exportArrayValueTemplate(meta, cb) {
  cb(" {{" + meta.template.section.replace(/^@/, "#") + "}} ");
  var valueKvp = {
    value: meta.src.value
  };
  exportYaml(valueKvp, cb);
  cb("{{#unless @last}},{{/unless}}");
  cb(" {{" + meta.template.section.replace(/^@/, "/") + "}} ");
}

function exportObjectValueTemplate(meta, cb) {
  cb(" {{" + meta.template.section + "}} ");
  exportObjectValue(meta, cb);
  cb(" {{" + meta.template.section.replace(/^#|^\^/, "/") + "}} ");
}

function exportSimpleValueTemplate(meta, cb) {
  cb(" {{" + meta.template.section.replace(/</, "#") + "}} ");
  cb("{{{" + meta.template.section.replace(/</, "") + "}}}");
  cb(" {{" + meta.template.section.replace(/</, "/") + "}} ");
}

function exportArrayValue(meta, cb) {
  var value = meta.src.value;
  var key = meta.src.key;
  
  cb("[");
  var lastKey = value.length - 1;
  value.forEach(function (childValue, childKey) {
    var childKvp = {
      value: childValue
    };
    
    exportYaml(childKvp, cb);
    
    if (childKey !== lastKey) {
      cb(",");
    }
  });
  cb("]");
}

function exportObjectValue(meta, cb) {
  var value = meta.src.value;
  var key = meta.src.key;
  
  cb("{");
  
  var childKeys = [];
  if (meta.children) childKeys = Object.getOwnPropertyNames(meta.children);
  var lastChildKeyIndex = childKeys.length - 1;
  
  childKeys.forEach(function (childKey, childKeyIndex) {
    // write the key
    cb(JSON.stringify(childKey) + ":");
    
    var firstChildMeta = meta.children[childKey][0];
    var isArrayTemplate = firstChildMeta.template && firstChildMeta.template.type === "array";
    
    // write the value
    if (isArrayTemplate) {
      cb("[");
    }
    
    // write the template sections or the untemplated value
    var lastChildMetaIndex = meta.children[childKey].length - 1;
    meta.children[childKey].forEach(function (childMeta, childMetaIndex) {
      var childKvp = {
        key: childMeta.src.key,
        value: value[childMeta.src.key]
      };
      
      exportYaml(childKvp, cb);
      
      if (childMetaIndex === lastChildMetaIndex && childKeyIndex !== lastChildKeyIndex) {
        cb(",");
      }
    });
    
    if (isArrayTemplate) {
      cb("]");
    }
  });
  
  cb("}");
}

function exportSimpleValue(meta, cb) {
  cb(JSON.stringify(meta.src.value));
}

function exportYaml(kvp, cb, options) {
  var meta = getMetadata(kvp);

  if (meta.template && meta.template.type === "array") {
    exportArrayValueTemplate(meta, cb);
  } else if (meta.template && meta.template.type === "object") {
    exportObjectValueTemplate(meta, cb);
  } else if (meta.template && meta.template.type === "simple") {
    exportSimpleValueTemplate(meta, cb);
  } else if (util.isArray(kvp.value)) {
    exportArrayValue(meta, cb);
  } else if (util.isObject(kvp.value)) {
    exportObjectValue(meta, cb);
  } else {
    exportSimpleValue(meta, cb);
  }
}

module.exports = exports = exportYaml;
