"use strict";

const util = require("util");
const getMetadata = require("../metadata-yaml");
const url = require("url");

function isNode(meta) {
  return meta.children && meta.children.spec && meta.children.value;
}

function isDynamic(meta) {
  return meta.templates !== undefined || meta.template !== undefined;
}

function isNotNullOrEmpty(meta) {
  var value = meta.src.value;
  return value !== null && value !== "";
}

function nodeHasProperty(kvp, meta, property, ensureNotNullOrEmpty) {
  if(!isNode(meta)) return false;

  var valueMeta = meta.children.value;
  if(valueMeta.more) valueMeta = valueMeta.more();
  if(valueMeta.templates) return false;
  if(!valueMeta.children || property in valueMeta.children === false) return false;
  if(!ensureNotNullOrEmpty) return true;

  var propertyMeta = valueMeta.children[property];
  if(propertyMeta.more) propertyMeta = propertyMeta.more();
  return isDynamic(propertyMeta) || isNotNullOrEmpty(propertyMeta);
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

function getValueMeta(meta) {
  if(meta.children.value.templates) {
    return meta.children.value.templates[0];
  }

  return meta.children.value.more();
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

  var valueMeta = getValueMeta(meta);

  if(isLiteralTemplate(valueMeta)) {
    addHint(kvp, "text");
  } else if(valueMeta.src.value !== undefined &&
    valueMeta.src.value !== null &&
    util.isPrimitive(valueMeta.src.value)) {
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

  var firstValueMeta = getValueMeta(meta);

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

function documentProperties(kvp, options) {
  // only do this for the root document kvp
  if(kvp.key) return;
  if(!util.isObject(kvp.value)) return;
  if(!options || !options.realm) return;

  if(util.isObject(kvp.value.value)) {
    ["base", "focus"].forEach(p => {
      if(kvp.value.value[p]) {
        kvp.value[p] = kvp.value.value[p];
        delete kvp.value.value[p];
      }
    });
    ["realm", "context"].forEach(p => {
      if(kvp.value.value[p]) {
        var meta = getMetadata(kvp);
        if(meta.children[p] && meta.children[p].templates) kvp.value[p] = kvp.value.value[p];
        else kvp.value[p] = url.resolve(options.realm.realm, kvp.value.value[p]);
        delete kvp.value.value[p];
      }
    });
  }

  if(!kvp.value.realm) kvp.value.realm = options.realm.realm;
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
  finish.documentProperties = documentProperties;
};
