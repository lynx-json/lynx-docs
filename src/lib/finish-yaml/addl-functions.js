"use strict";

const util = require("util");
const getMetadata = require("../metadata-yaml");
const url = require("url");

function isNode(meta) {
  return meta.children && meta.children.spec && meta.children.value;
}

function isDynamic(meta) {
  return meta.template !== undefined;
}

function isNotNullOrEmpty(meta) {
  var value = meta.src.value;
  return value !== null && value !== "";
}

function nodeHasProperty(kvp, meta, property, ensureNotNullOrEmpty) {
  if(!isNode(meta)) return false;
  return meta.children.value.some(function (childMeta) {
    childMeta = childMeta.more();
    if(!childMeta.children || property in childMeta.children === false) return false;
    if(!ensureNotNullOrEmpty) return true;

    var propertyMeta = childMeta.children[property][0].more();
    return isDynamic(propertyMeta) || isNotNullOrEmpty(propertyMeta);
  });
}

var baseHints = ["text", "content", "container", "link", "submit", "form"];

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
  if(!kvp.value || !kvp.value.spec) return;
  if(!kvp.value.spec.hints) return;
  if(kvp.value.spec.hints.indexOf(hint) !== -1) return;
  if(!util.isArray(kvp.value.spec.hints)) {
    var meta = getMetadata(kvp);
    throw new Error("The 'hints' property of a spec must be an array for '" + meta.key + "'.");
  }
  if(isBaseHint(hint) && kvp.value.spec.hints.some(isBaseHint)) return;
  kvp.value.spec.hints.push(hint);
}

function text(kvp, options) {
  var meta = getMetadata(kvp);
  if(!isNode(meta)) return;

  var valueMetas = meta.children.value.map(cm => cm.more());
  var firstValueMeta = valueMetas[0];

  if(isLiteralTemplate(firstValueMeta)) {
    addHint(kvp, "text");
  }

  if(isLiteralTemplate(firstValueMeta)) {
    addHint(kvp, "text");
  } else if(firstValueMeta.src.value !== undefined &&
    firstValueMeta.src.value !== null &&
    util.isPrimitive(firstValueMeta.src.value)) {
    addHint(kvp, "text");
  }
}

function links(kvp, options) {
  var meta = getMetadata(kvp);
  if(nodeHasProperty(kvp, meta, "href")) {
    if(!nodeHasProperty(kvp, meta, "type", true)) throw new Error("Missing 'type' attribute for '" + meta.key + "'");
    if(!nodeHasProperty(kvp, meta, "href", true)) throw new Error("'href' cannot be null/empty for '" + meta.key + "'");
    addHint(kvp, "link");
  }
}

function submits(kvp, options) {
  var meta = getMetadata(kvp);
  if(nodeHasProperty(kvp, meta, "action")) {
    var node = kvp.value;
    if(node.value.action === null || node.value.action === "") throw new Error("'action' cannot be null/empty for '" + meta.key + "'");
    addHint(kvp, "submit");
  }
}

function hasImageProperties(kvp, meta) {
  return nodeHasProperty(kvp, meta, "height") &&
    nodeHasProperty(kvp, meta, "width");
}

function images(kvp, options) {
  var meta = getMetadata(kvp);
  if(hasImageProperties(kvp, meta)) {
    validateContentNode(kvp, meta);
    addHint(kvp, "image");
  }
}

function content(kvp, options) {
  var meta = getMetadata(kvp);
  if(nodeHasProperty(kvp, meta, "src")) {
    validateContentNode(kvp, meta);
    addHint(kvp, "content");
  }
}

function validateContentNode(kvp, meta) {
  var node = kvp.value;
  if(!node.value) return;
  if(node.value.src === null || node.value.src === "") throw new Error("'src' cannot be null/empty for '" + meta.key + "'");
  if(!nodeHasProperty(kvp, meta, "type")) throw new Error("Missing 'type' attribute for '" + meta.key + "'");
}

function containers(kvp, options) {
  var meta = getMetadata(kvp);
  if(!isNode(meta)) return;

  var valueMetas = meta.children.value.map(cm => cm.more());
  var firstValueMeta = valueMetas[0];

  if(isObjectTemplate(firstValueMeta) || isArrayTemplate(firstValueMeta)) {
    addHint(kvp, "container");
  } else if(util.isObject(firstValueMeta.src.value)) {
    addHint(kvp, "container");
  }

  if(nodeHasProperty(kvp, meta, "scope")) {
    var node = kvp.value;
    if(node.value.scope && options && options.realm) {
      node.value.scope = url.resolve(options.realm.realm, node.value.scope);
    }
  }
}

function forms(kvp, options) {
  var meta = getMetadata(kvp);
  if(meta.key && meta.key.match(/form/i)) {
    addHint(kvp, "form");
  }
}

function markers(kvp, options) {
  var meta = getMetadata(kvp);
  if(nodeHasProperty(kvp, meta, "for")) {
    addHint(kvp, "marker");

    var node = kvp.value;
    if(node.value.for && options && options.realm) {
      node.value.for = url.resolve(options.realm.realm, node.value.for);
    }
  }
}

module.exports = exports = function (finish) {
  finish.addHint = addHint;

  finish.links = links;
  finish.images = images;
  finish.text = text;
  finish.content = content;
  finish.markers = markers;
  finish.containers = containers;
  finish.forms = forms;
  finish.submits = submits;
};
