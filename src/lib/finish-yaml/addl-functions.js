var util = require("util");
var getMetadata = require("../metadata-yaml");

function isNode(meta) {
  return meta.children && meta.children.spec && meta.children.value;
}

function nodeHasProperty(kvp, meta, property) {
  if (!isNode(meta)) return false;
  return meta.children.value.map(mapExpandedChildMetadata(kvp.value)).some(function (childMeta) {
    return childMeta.children && property in childMeta.children;
  });
}

function mapExpandedChildMetadata(value) {
  return function (childMeta) {
    var childKvp = { key: childMeta.src.key, value: value[childMeta.src.key] };
    return getMetadata(childKvp);
  };
}

function titles(kvp, options) {
  var meta = getMetadata(kvp);
  if (nodeHasProperty(kvp, meta, "title")) {
    kvp.value.spec.labeledBy = "title";  
  } else if (meta.key === "title" && kvp.value.spec.hints.indexOf("label") === -1) {
    kvp.value.spec.hints.push("label");
  }
}

function labels(kvp, options) {
  var meta = getMetadata(kvp);
  if (meta.key === "label" && util.isString(kvp.value.value) && kvp.value.spec.hints.indexOf("label") === -1) {
    kvp.value.spec.hints.push("label");
  }
}

module.exports = exports = function (finish) {
  finish.titles = titles;
  finish.labels = labels;
};
