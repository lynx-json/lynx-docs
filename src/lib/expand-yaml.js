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
  keyMatches(/^data$/),
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

function getKVP(yaml) {
  if (!util.isObject(yaml)) return {
    key: undefined,
    value: yaml
  };

  var props = Object.getOwnPropertyNames(yaml);

  if (props.length === 1 && getMetadata(props[0]).key === undefined) {
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
  if (!meta.children || !meta.children.spec) {
    kvp.value.spec = {
      hints: []
    };
    return;
  }

  var specMetas = meta.children.spec;
  specMetas.map(sm => sm.more()).forEach(function (specMeta) {
    if (specMeta.children && specMeta.children.hints) return;
    specMeta.src.value.hints = [];
  });
}

function expandArrayItem(options) {
  return function (val, idx, arr) {
    var kvp = getKVP(val);
    return expandKvp(kvp, options).value;
  };
}

function expandObject(obj, options) {
  var expanded = {};
  Object.getOwnPropertyNames(obj).forEach(function (key) {
    var kvp = {
      key: key,
      value: obj[key]
    };
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
    kvp.value.value = [kvp.value.value];
  }

  meta.children.value.forEach(function (valueMeta) {
    valueMeta = valueMeta.more();
    let value = kvp.value[valueMeta.src.key];

    if (util.isArray(value)) {
      kvp.value[valueMeta.src.key] = value.map(expandArrayItem(options));
    } else if (util.isObject(value)) {
      kvp.value[valueMeta.src.key] = expandObject(value, options);
    }
  });

  return kvp;
}

expandKvp.blacklist = blacklist;

module.exports = exports = expandKvp;
