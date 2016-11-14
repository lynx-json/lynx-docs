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

function addHint(kvp, hint) {
  if (!kvp.value || !kvp.value.spec) return;
  if (!kvp.value.spec.hints) return;
  if (kvp.value.spec.hints.indexOf(hint) !== -1) return;
  if (isBaseHint(hint) && kvp.value.spec.hints.some(isBaseHint)) return;
  kvp.value.spec.hints.push(hint);
}

function text(kvp, options) {
  var meta = getMetadata(kvp);
  if (meta.template && meta.template.type === "literal") {
    addHint(kvp, "text");
  } else if (isNode(meta) && 
    meta.children.value[0].template &&
    meta.children.value[0].template.type === "literal") {
    addHint(kvp, "text");
  }
  else if (isNode(meta) && kvp.value.value !== null && util.isPrimitive(kvp.value.value)) {
    addHint(kvp, "text");
  }
}

function addLabeledBy(kvp, labelProperty) {
  kvp.value.spec.labeledBy = kvp.value.spec.labeledBy || labelProperty;
}

function labels(kvp, options) {
  var meta = getMetadata(kvp);
  if (meta.key === "label" && util.isString(kvp.value.value)) {
    addHint(kvp, "label");
  } else if (nodeHasProperty(kvp, meta, "title")) {
    addLabeledBy(kvp, "title");
  } else if (nodeHasProperty(kvp, meta, "header")) {
    addLabeledBy(kvp, "header");
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
    addHint(kvp, "link");
    if (!nodeHasProperty(kvp, meta, "type")) throw new Error("Missing 'type' attribute in link.");
  }
}

function submits(kvp, options) {
  var meta = getMetadata(kvp);
  if (nodeHasProperty(kvp, meta, "action")) {
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
    if (!nodeHasProperty(kvp, meta, "type")) throw new Error("Missing 'type' attribute in image.");
  }
}

function content(kvp, options) {
  var meta = getMetadata(kvp);
  if (nodeHasProperty(kvp, meta, "src") && !hasImageProperties(kvp, meta)) {
    addHint(kvp, "content");
    if (!nodeHasProperty(kvp, meta, "type")) throw new Error("Missing 'type' attribute in content.");
  }
}

function containers(kvp, options) {
  var meta = getMetadata(kvp);
  
  if (meta.template &&
    (meta.template.type === "object" || meta.template.type === "array")) {
    addHint(kvp, "container");
  } else if (isNode(meta) &&
    meta.children.value && 
    meta.children.value[0].template &&
    meta.children.value[0].template.type === "array") {
    addHint(kvp, "container");        
  } else if (isNode(meta) && util.isObject(kvp.value.value)) {
    addHint(kvp, "container");
  }
  
  if (nodeHasProperty(kvp, meta, "scope")) {
    var node = kvp.value;
    console.log("kvp", kvp);
    console.log("meta", meta);
    if (node.value.scope && options && options.realm) {
      node.value.scope = url.resolve(options.realm, node.value.scope);
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
      node.value.for = url.resolve(options.realm, node.value.for);
    }
  }
}

module.exports = exports = function(finish) {
  finish.addHint = addHint;
  
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
