"use strict";

const util = require("util");
const getMetadata = require("../metadata-yaml");
const url = require("url");


function isNode(meta) {
  return meta.children && meta.children.spec && meta.children.value;
}

function nodeHasProperty(kvp, meta, property) {
  if (!isNode(meta)) return false;
  return meta.children.value.map(mapExpandedChildMetadata(kvp.value)).some(function(childMeta) {
    return childMeta.children && property in childMeta.children;
  });
}

function mapExpandedChildMetadata(value) {
  return function(childMeta) {
    var childKvp = { key: childMeta.src.key, value: value[childMeta.src.key] };
    return getMetadata(childKvp);
  };
}

var baseHints = ["text","content","container","link","submit","form"];

function isBaseHint(hint) {
  function match(baseHint) {
    return baseHint === hint;
  }

  return baseHints.some(match);
}

function isObjectTemplate(meta) {
  return meta.template && meta.template.type === "object";
}

function isArrayTemplate(meta) {
  return meta.template && meta.template.type === "array";
}

function isLiteralTemplate(meta) {
  return meta.template && meta.template.type === "literal";
}

function addHint(kvp, hint) {
  if (!kvp.value || !kvp.value.spec) return;
  if (!kvp.value.spec.hints) return;
  if (kvp.value.spec.hints.indexOf(hint) !== -1) return;
  if(!util.isArray(kvp.value.spec.hints)) {
    var meta = getMetadata(kvp);
    throw new Error("The 'hints' property of a spec must be an array for '" + meta.key + "'.");
  }
  if (isBaseHint(hint) && kvp.value.spec.hints.some(isBaseHint)) return;
  kvp.value.spec.hints.push(hint);
}

function text(kvp, options) {
  var meta = getMetadata(kvp);
  if (!isNode(meta)) return;

  var valueMetas = meta.children.value.map(cm => cm.more());
  var firstValueMeta = valueMetas[0];

  if (isLiteralTemplate(firstValueMeta)) {
    addHint(kvp, "text");
  }

  if (isLiteralTemplate(firstValueMeta)) {
        addHint(kvp, "text");
  } else if (firstValueMeta.src.value !== undefined &&
      firstValueMeta.src.value !== null &&
      util.isPrimitive(firstValueMeta.src.value)) {
        addHint(kvp, "text");
  }
}

function addLabeledBy(kvp, labelProperty) {
  kvp.value.spec.labeledBy = kvp.value.spec.labeledBy || labelProperty;
}

function labels(kvp, options) {
  var meta = getMetadata(kvp);
  if (!isNode(meta)) return;

  var valueMetas = meta.children.value.map(cm => cm.more());
  var firstValueMeta = valueMetas[0];

  if (meta.key === "label" && util.isString(firstValueMeta.src.value)) {
    addHint(kvp, "label");
  } else if (nodeHasProperty(kvp, meta, "title")) {
    addLabeledBy(kvp, "title");
  } else if (nodeHasProperty(kvp, meta, "header")) {
    addLabeledBy(kvp, "header");
  } else if (nodeHasProperty(kvp, meta, "label")) {
    addLabeledBy(kvp, "label");
  }
}

function titles(kvp, options) {
  var meta = getMetadata(kvp);
  if (meta.key === "title") {
    addHint(kvp, "label");
  }
}

function headers(kvp, options) {
  var meta = getMetadata(kvp);
  
  if (meta.key === "header") {
    addHint(kvp, "header");
    addHint(kvp, "label");
  }
}

function links(kvp, options) {
  var meta = getMetadata(kvp);
  if (nodeHasProperty(kvp, meta, "href")) {
    var node = kvp.value;

    if (!nodeHasProperty(kvp, meta, "type") ||
      node.value.type === null ||
      node.value.type === "") throw new Error("Missing 'type' attribute for '" + meta.key + "'");

    if (node.value.href === null || node.value.href === "") throw new Error("'href' cannot be null/empty for '" + meta.key + "'");

    addHint(kvp, "link");
  }
}

function submits(kvp, options) {
  var meta = getMetadata(kvp);
  if (nodeHasProperty(kvp, meta, "action")) {
    var node = kvp.value;
    if (node.value.action === null || node.value.action === "") throw new Error("'action' cannot be null/empty for '" + meta.key + "'");
    addHint(kvp, "submit");
  }
}

function hasImageProperties(kvp, meta) {
  return nodeHasProperty(kvp, meta, "height") &&
    nodeHasProperty(kvp, meta, "width");
}

function images(kvp, options) {
  var meta = getMetadata(kvp);
  if (hasImageProperties(kvp, meta)) {
    addHint(kvp, "image");
    if (!nodeHasProperty(kvp, meta, "type")) throw new Error("Missing 'type' attribute for '" + meta.key + "'");
  }
}

function content(kvp, options) {
  var meta = getMetadata(kvp);
  if (nodeHasProperty(kvp, meta, "src") && !hasImageProperties(kvp, meta)) {
    var node = kvp.value;
    if (node.value.src === null || node.value.src === "") throw new Error("'src' cannot be null/empty for '" + meta.key + "'");
    if (!nodeHasProperty(kvp, meta, "type")) throw new Error("Missing 'type' attribute for '" + meta.key + "'");
    addHint(kvp, "content");
  }
}

function containers(kvp, options) {
  var meta = getMetadata(kvp);
  if (!isNode(meta)) return;

  var valueMetas = meta.children.value.map(cm => cm.more());
  var firstValueMeta = valueMetas[0];

  if (isObjectTemplate(firstValueMeta) || isArrayTemplate(firstValueMeta)) {
        addHint(kvp, "container");
  } else if (util.isObject(firstValueMeta.src.value)) {
        addHint(kvp, "container");
  }

  if (nodeHasProperty(kvp, meta, "scope")) {
    var node = kvp.value;
    if (node.value.scope && options && options.realm) {
      node.value.scope = url.resolve(options.realm.realm, node.value.scope);
    }
  }
}

function forms(kvp, options) {
  var meta = getMetadata(kvp);
  if (meta.key && meta.key.match(/form/i)) {
    addHint(kvp, "form");
  }
}

function sections(kvp, options) {
  var meta = getMetadata(kvp);
  if (nodeHasProperty(kvp, meta, "header")) {
    addHint(kvp, "section");
  } else if (meta.key && meta.key.match(/section/i)) {
    addHint(kvp, "section");
  }
}

function markers(kvp, options) {
  var meta = getMetadata(kvp);
  if (nodeHasProperty(kvp, meta, "for")) {
    addHint(kvp, "marker");

    var node = kvp.value;
    if (node.value.for && options && options.realm) {
      node.value.for = url.resolve(options.realm.realm, node.value.for);
    }
  }
}

module.exports = exports = function(finish) {
  finish.addHint = addHint;

  finish.headers = headers;
  finish.titles = titles;
  finish.labels = labels;
  finish.links = links;
  finish.images = images;
  finish.text = text;
  finish.content = content;
  finish.markers = markers;
  finish.containers = containers;
  finish.forms = forms;
  finish.submits = submits;
  finish.sections = sections;
};
