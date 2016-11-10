"use strict";

var util = require("util");
var partials = require("./partials-yaml");
var getMetadata = require("./metadata-yaml");

function keyMatches(regex) {
  return function (meta) {
    return regex.test(meta.key);
  };
}

var blacklist = [
  keyMatches(/^href$/),
  keyMatches(/^src$/),
  keyMatches(/^action$/),
  keyMatches(/^method$/),
  keyMatches(/^type$/),
  keyMatches(/^enctype$/),
  keyMatches(/^height$/),
  keyMatches(/^width$/),
  keyMatches(/^realm$/),
  keyMatches(/^scope$/),
  keyMatches(/^context$/),
  keyMatches(/^alt$/),
  keyMatches(/^for$/)
];

function isBlacklisted(meta) {
  return blacklist.some(function (predicate) {
    return predicate(meta);
  });
}

function ensureSpec(kvp) {
  var meta = getMetadata(kvp);
  if (!meta.children || !meta.children.spec) {
    kvp.value.spec = {};
  }
  
  var specMeta = getMetadata({ key: "spec", value: kvp.value.spec });
  if (!specMeta.children || !specMeta.children.hints) {
    kvp.value.spec.hints = [];
  }
  
  specMeta = getMetadata({ key: "spec", value: kvp.value.spec });
  if (specMeta.children && 
    specMeta.children.hints && 
    !specMeta.children.hints[0].template && 
    !util.isArray(kvp.value.spec.hints)) {
      kvp.value.spec.hints = [kvp.value.spec.hints];
  }
}

function expandArrayItem(val, idx, arr) {
  return expandKvp({ key: idx, value: val }).value;
}

function expandObject(obj, options) {
  var expanded = {};
  Object.getOwnPropertyNames(obj).forEach(function (key) {
    var kvp = { key: key, value: obj[key] };
    kvp = expandKvp(kvp, options);
    expanded[kvp.key] = kvp.value;
  });
  return expanded;
}

function expandKvp(kvp, options) {
  var meta = getMetadata(kvp);
  
  if (meta.partial) {
    kvp = partials.getPartial(kvp, options);
    meta = getMetadata(kvp);
  }
  
  if (isBlacklisted(meta)) return kvp;
  
  if (meta.children && meta.children.value) {
    ensureSpec(kvp);
  } else if (meta.children && meta.children.spec) {
    ensureSpec(kvp);
    kvp.value.value = null;
  } else {
    if (meta.template) {
      kvp.key = meta.key;
      var newValue = {
        spec: {
          hints: []
        }
      };
      newValue["value" + meta.template.section] = kvp.value;
      kvp.value = newValue;
    } else {
      kvp.value = {
        spec: {
          hints: []
        },
        value: kvp.value
      };  
    }
  }
  
  meta = getMetadata(kvp);
  
  if (meta.template && meta.template.type === "array" && !util.isArray(kvp.value.value)) {
    kvp.value.value = [ kvp.value.value ];
  }
  
  meta.children.value.forEach(function (valueMeta) {
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

expandKvp.blacklist = blacklist;

module.exports = exports = expandKvp;
