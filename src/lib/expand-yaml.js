"use strict";

var YAML = require("yamljs");
var util = require("util");
var partials = require("./partials-yaml");
var getMetadata = require("./metadata-yaml");

function info() {
  // console.log(arguments);
}

function isValuePropertyName(key) {
  return getMetadata(key).key === "value";
}

function hasValueProperty(obj) {
  if (!obj || util.isArray(obj)) return false;
  return Object.getOwnPropertyNames(obj).some(isValuePropertyName);
}

function getValuePropertyName(obj) {
  // this is arbitrary right now - allowing only one value property
  // it might be valid to have two value keys - value#dataProperty and value^dataProperty
  // and, if so, both should be expanded
  var propertyNames = Object.getOwnPropertyNames(obj);
  var valuePropertyNames = propertyNames.filter(isValuePropertyName);
  if (valuePropertyNames.length > 1) throw new Error("More than one 'value' property found.");
  if (valuePropertyNames.length === 0 ) throw new Error("No 'value' property found.");
  return valuePropertyNames[0];
}

function isNodeLike(value) {
  info("isNodeLike");
  return util.isObject(value) && ("spec" in value || hasValueProperty(value));
}

function convertValueToNode(value) {
  info("convertValueToNode");
  return {
    spec: { hints: [] },
    value: value
  };
}

function expandNode(node, options) {
  info("expandNode");
  if (!hasValueProperty(node)) node.value = null;
  if (!node.spec) node.spec = { hints: [] };
  if (!node.spec.hints) node.spec.hints = [];
  if (!util.isArray(node.spec.hints)) node.spec.hints = [node.spec.hints];
  return node;
}

function expandNodeValue(node, options) {
  info("expandNodeValue", node.value);
  var valueKey = getValuePropertyName(node);
  var kvp = { value: node[valueKey], key: valueKey};

  if (partials.isPartial(kvp)) {
    var partial = partials.getPartial(kvp, options);
    var replacement = expandValue({ value: partial.value, key: partial.key }, options).value;
    delete node[valueKey];
    node.value = replacement.value;
    node.spec = replacement.spec;
    return;
  }

  if (util.isArray(node[valueKey])) {
    node[valueKey] = node[valueKey].map(function (childValue, childKey) {
      return expandValue({ value: childValue, key: childKey }, options).value;
    });
  }
  else if (util.isObject(node[valueKey])) {
    Object.getOwnPropertyNames(node[valueKey]).forEach(function (childKey) {
      var childValue = node[valueKey][childKey];
      var childKvp = { value: childValue, key: childKey };

      if (partials.isPartial(childKvp)) {
        childKvp = partials.getPartial(childKvp, options);
        delete node[valueKey][childKey];
      }

      node[valueKey][childKey] = expandValue(childKvp, options).value;
    });
  }
}

function expandValue(kvp, options) {
  info("expandValue", kvp);
  var node;

  if (isNodeLike(kvp.value)) {
    node = expandNode(kvp.value, options);
  }
  else {
    node = convertValueToNode(kvp.value, options);
  }
  
  if (kvp.key) {
    var metadata = getMetadata(kvp.key);
    node.spec.name = metadata.key;
  }
  
  expandNodeValue(node, options);

  var result = {
    key: kvp.key,
    value: node || kvp.value
  };

  return result;
}

module.exports = exports = expandValue;
