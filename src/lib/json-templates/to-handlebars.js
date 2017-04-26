"use strict";

const traverse = require("traverse");
const templateKey = require("./template-key");
const types = require("../../types");
const simpleTypes = ["number", "boolean", "string"];

function toHandlebars(model) {
  let buffer = "";

  function writeContent(content) {
    buffer += content;
  }

  function writeOpenBinding(binding) {
    if (templateKey.simpleTokens.includes(binding.token)) {
      let quote = binding.token === "<" ? "\"" : "";
      writeContent("{{#if " + binding.variable + "}}" + quote + "{{" + binding.variable + "}}" + quote + "{{else}}");
    } else if (templateKey.sectionTokens.includes(binding.token)) {
      writeContent("{{" + binding.token + binding.variable + "}}");
    } else if (templateKey.iteratorToken === binding.token) {
      writeContent("{{#each " + binding.variable + "}}");
    }
  }

  function writeCloseBinding(binding, separate) {
    if (templateKey.simpleTokens.includes(binding.token)) writeContent("{{/if}}");
    else if (templateKey.sectionTokens.includes(binding.token)) writeContent("{{/" + binding.variable + "}}");
    else if (templateKey.iteratorToken === binding.token) writeContent("{{#unless @last}},{{/unless}}{{/each}}");
  }

  function writeSimpleValue(value, binding, separate) {
    if (binding) writeOpenBinding(binding);
    writeContent(JSON.stringify(value));
    if (binding) writeCloseBinding(binding, separate);
    if (separate) writeContent(",");
  }

  function writeArrayValue(traverseNode, separate) {
    traverseNode.before(function () {
      writeContent("[");
    });

    traverseNode.after(function () {
      writeContent("]");
      if (separate) writeContent(",");
    });
  }

  function writeObjectValue(traverseNode, binding, separate) {
    let metas = traverseNode.keys.map(templateKey.parse);
    let writeBraces = metas.length === 0 || metas.some(child => !!child.name);

    traverseNode.before(function () {
      if (binding) writeOpenBinding(binding);
      if (writeBraces) writeContent("{");
    });

    traverseNode.after(function () {
      if (writeBraces) writeContent(" }");
      if (binding) {
        writeCloseBinding(binding);
        if (binding.token === templateKey.iteratorToken &&
          shouldSeparate(traverseNode.parent) &&
          isIteratorContainer(traverseNode.parent)) {
          //this is to handle the situation where an iterator is mixed into
          //the middle of an array but the value binding to the iterator doesn't exist
          //only output the separator if we actually created output with the iterator
          writeContent("{{#if " + binding.variable + "}},{{/if}}");
        }
      }
      if (separate && !isIteratorContainer(traverseNode)) writeContent(",");
    });
  }

  function isIteratorContainer(traverseNode) {
    if (!traverseNode.keys || traverseNode.keys.length !== 1) return false;
    let metas = traverseNode.keys.map(templateKey.parse);
    return metas.every(meta => meta.binding && meta.binding.token === templateKey.iteratorToken);
  }

  function shouldSeparate(traverseNode, meta, binding) {
    if (binding && templateKey.sectionTokens.includes(binding.token)) return false;
    return traverseNode.parent &&
      traverseNode.parent.keys.indexOf(traverseNode.key) !== traverseNode.parent.keys.length - 1;
  }

  traverse(model).forEach(function (value) {
    let inArray = this.parent && types.isArray(this.parent.node);
    let meta = this.parent && !inArray && this.key && templateKey.parse(this.key);
    if (meta && meta.name) writeContent(JSON.stringify(meta.name) + ":");

    let binding = meta && meta.binding;
    let separate = shouldSeparate(this, meta, binding);

    if (value === null || simpleTypes.includes(typeof value)) return writeSimpleValue(value, binding, separate);

    if (types.isArray(value)) writeArrayValue(this, separate);
    else writeObjectValue(this, binding, separate);
  });

  return buffer;
}

module.exports = exports = toHandlebars;
