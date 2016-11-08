"use strict";

var util = require("util");
var partials = require("./partials-yaml");
var getMetadata = require("./metadata-yaml");

function ensureSpec(kvp) {
  var meta = getMetadata(kvp);
  kvp.value.spec = kvp.value.spec || {};
  kvp.value.spec.hints = kvp.value.spec.hints || [];
  if (!util.isArray(kvp.value.spec.hints)) kvp.value.spec.hints = [kvp.value.spec.hints];
}

function expandArrayItem(val, idx, arr) {
  return expandKvp({ key: idx, value: val }).value;
}

function expandObject(obj, options) {
  Object.getOwnPropertyNames(obj).forEach(function (key) {
    var kvp = { key: key, value: obj[key] };
    kvp = expandKvp(kvp, options);
    delete obj[key];
    obj[kvp.key] = kvp.value;
  });
  return obj;
}

function expandKvp(kvp, options) {
  var meta = getMetadata(kvp);
  
  if (meta.partial) {
    kvp = partials.getPartial(kvp, options);
    meta = getMetadata(kvp);
  }
  
  if (meta.children && meta.children.value) {
    ensureSpec(kvp);
  } else if (meta.children && meta.children.spec) {
    ensureSpec(kvp);
    kvp.value.value = null;
  } else {
    kvp.value = {
      spec: {
        hints: []
      },
      value: kvp.value
    };
  }
  
  meta = getMetadata(kvp);
  
  if (meta.template && meta.template.type === "array" && !util.isArray(kvp.value.value)) {
    kvp.value.value = [ kvp.value.value ];
  }
  
  meta.children.value.forEach(function (valueMeta) {
    if (valueMeta.template && 
        valueMeta.template.type === "array" && 
        !util.isArray(kvp.value[valueMeta.src.key])) {
      kvp.value[valueMeta.src.key] = [kvp.value[valueMeta.src.key]];
    }
    
    valueMeta = valueMeta.more();
    let value = kvp.value[valueMeta.src.key];
    
    if (util.isArray(value)) {
      kvp.value[valueMeta.src.key] = value.map(expandArrayItem);
    } else if (util.isObject(value)) {
      kvp.value[valueMeta.src.key] = expandObject(value, options);
    }
  });
  
  return kvp;
}

module.exports = exports = expandKvp;
