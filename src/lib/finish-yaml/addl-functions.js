"use strict";

var util = require("util");
var getMetadata = require("../metadata-yaml");

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

function addHint(kvp, hint) {
  if (!kvp.value || !kvp.value.spec) return;
  if (kvp.value.spec.hints.indexOf(hint) !== -1) return;
  kvp.value.spec.hints.push(hint);
}

function toDataProperty(kvp, property) {
  if (!kvp.value || !kvp.value.value || !util.isObject(kvp.value.value)) return;
  if (property in kvp.value.value === false) return;
  if ("value" in kvp.value.value[property] === false) return;
  kvp.value.value[property] = kvp.value.value[property].value;
}

function text(kvp, options) {
  var meta = getMetadata(kvp);
  if (meta.template && meta.template.type === "simple") {
    addHint(kvp, "text");
  } else if (isNode(meta) && util.isString(kvp.value.value)) {
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

// TODO: determine how to handle templates for hypermedia control references
// this might just naturally be answered if we add support for string templates.
// e.g. The following:
// href#urls.orders.index:
// might be interpreted as:
// href: {{#urls.orders.index}}{{{urls.orders.index}}}{{/urls.orders.index}}
//       {{^urls.orders.index}}null{{/urls.orders.index}}
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
  } else if (isNode(meta) && util.isObject(kvp.value.value)) {
    addHint(kvp, "container");
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
    // TODO: figure out what to do w/ the 'for' attribute value
    // previously, we did this:
    // valueSpecTuple.value.for = url.resolve(realmBaseURI, "." + valueSpecTuple.value.for);
  }
}

function dataProperties(kvp, options) {
  var meta = getMetadata(kvp);
  if (!isNode(meta)) return;
  toDataProperty(kvp, "href");
  toDataProperty(kvp, "src");
  toDataProperty(kvp, "action");
  toDataProperty(kvp, "method");
  toDataProperty(kvp, "type");
  toDataProperty(kvp, "enctype");
  toDataProperty(kvp, "height");
  toDataProperty(kvp, "width");
  toDataProperty(kvp, "realm");
  toDataProperty(kvp, "scope");
  toDataProperty(kvp, "alt");
  toDataProperty(kvp, "for");
}

module.exports = exports = function(finish) {
  finish.titles = titles;
  finish.labels = labels;
  finish.links = links;
  finish.images = images;
  finish.text = text;
  finish.content = content;
  finish.containers = containers;
  finish.forms = forms;
  finish.submits = submits;
  finish.sections = sections;
  finish.dataProperties = dataProperties;
};
