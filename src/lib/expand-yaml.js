"use strict";

var util = require("util");
var partials = require("./partials-yaml");
var getMetadata = require("./metadata-yaml");

function keyMatches(regex) {
  return function (meta) {
    return regex.test(meta.key);
  };
}

var excludes = [
  keyMatches(/^spec$/),
  keyMatches(/^href$/),
  keyMatches(/^follow$/),
  keyMatches(/^src$/),
  keyMatches(/^data$/),
  keyMatches(/^action$/),
  keyMatches(/^method$/),
  keyMatches(/^send$/),
  keyMatches(/^type$/),
  keyMatches(/^enctype$/),
  keyMatches(/^encoding$/),
  keyMatches(/^height$/),
  keyMatches(/^width$/),
  keyMatches(/^realm$/),
  keyMatches(/^scope$/),
  keyMatches(/^context$/),
  keyMatches(/^base$/),
  keyMatches(/^focus$/),
  keyMatches(/^alt$/),
  keyMatches(/^for$/)
];

function isExcluded(meta) {
  return excludes.some(function (predicate) {
    return predicate(meta);
  });
}

function getKVP(yaml) {
  if(!util.isObject(yaml)) return {
    key: undefined,
    value: yaml
  };

  var props = Object.getOwnPropertyNames(yaml);

  if(props.length === 1 && getMetadata(props[0]).key === undefined) {
    return {
      key: props[0],
      value: yaml[props[0]]
    };
  }

  return {
    key: undefined,
    value: yaml
  };
}

function ensureSpec(kvp) {
  var meta = getMetadata(kvp);
  if(!meta.children || !meta.children.spec || kvp.value.spec === null) {
    kvp.value.spec = {
      hints: []
    };
    return;
  }

  var specMeta = meta.children.spec;
  if(specMeta.more) specMeta = specMeta.more();
  if(specMeta.children && specMeta.children.hints) return;
  specMeta.src.value.hints = [];
}

function hasMultipleTemplates(meta, childKey) {
  return meta.children &&
    meta.children[childKey] &&
    meta.children[childKey].templates &&
    meta.children[childKey].templates.length > 1;
}

function expandKvp(kvp, options, skipOptimization) {
  function log(msg, kvp) {
    // console.log(msg, kvp);
  }

  log("in", util.inspect(kvp));
  var meta = getMetadata(kvp);

  if(meta.partial) {
    kvp = partials.getPartial(kvp, options);
    if(!kvp) throw new Error("Failed to locate partial '" + meta.partial.name + "'. Realm folder: " + options.realm.folder + ".");
    meta = getMetadata(kvp);
  }

  if(isExcluded(meta)) return kvp;

  if(Array.isArray(kvp.value)) {
    kvp.value.forEach((val, idx, arr) => {
      arr[idx] = expandKvp({ value: val }, options).value;
    });
  } else if(util.isObject(kvp.value)) {
    let newValue = {};

    Object.getOwnPropertyNames(kvp.value).forEach(propertyName => {
      let ckvp = { key: propertyName, value: kvp.value[propertyName] };
      let cmeta = getMetadata(ckvp.key);
      ckvp = expandKvp(ckvp, options, hasMultipleTemplates(meta, cmeta.key));
      newValue[ckvp.key] = ckvp.value;
    });

    kvp.value = newValue;
    meta = getMetadata(kvp);
  }

  if(meta.key === "value") {
    log("out", util.inspect(kvp));
    return kvp;
  }

  if(meta.templates) {
    log("out", util.inspect(kvp));
    return kvp;
  }

  if(meta.children && meta.children.value) {
    ensureSpec(kvp);
    log("out", util.inspect(kvp));
    return kvp;
  }

  if(meta.children && meta.children.spec) {
    ensureSpec(kvp);
    kvp.value.value = null;
    log("out", util.inspect(kvp));
    return kvp;
  }

  if(meta.key && meta.template && !skipOptimization) {
    let expanded = {
      spec: {
        hints: []
      }
    };

    expanded["value" + meta.template.section] = kvp.value;
    kvp.key = meta.key;
    kvp.value = expanded;
    log("out", util.inspect(kvp));
    return kvp;
  }

  kvp.value = {
    spec: {
      hints: []
    },
    value: kvp.value
  };

  log("out", util.inspect(kvp));
  return kvp;
}

expandKvp.excludes = excludes;

module.exports = exports = expandKvp;
