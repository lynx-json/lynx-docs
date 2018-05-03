"use strict";

const traverse = require("traverse");
const templateKey = require("./template-key");
const types = require("../../types");
const simpleTypes = ["number", "boolean", "string"];

function toHandlebars(model, options) {
  let buffer = "";
  options = options || {};

  function writeContent(content) {
    buffer += content;
  }

  function writeOpenBinding(binding) {
    if (templateKey.simpleTokens.includes(binding.token)) {
      let quote = binding.token === "<" ? "\"" : "";
      let directives = options.allowBindToZeroAndEmptyString ? " includeZero=true" : "";
      writeContent(`{{#if ${binding.variable}${directives}}}${quote}{{${binding.variable}}}${quote}{{else}}`);
    } else if (templateKey.sectionTokens.includes(binding.token)) {
      writeContent(`{{${binding.token}${binding.variable}}}`);
    } else if (templateKey.iteratorToken === binding.token) {
      writeContent(`{{#each ${binding.variable}}}`);
    }
  }

  function writeCloseBinding(binding, separate) {
    if (templateKey.simpleTokens.includes(binding.token)) writeContent("{{/if}}");
    else if (templateKey.sectionTokens.includes(binding.token)) writeContent("{{/" + binding.variable + "}}");
    else if (templateKey.iteratorToken === binding.token) writeContent("{{#unless @last}},{{/unless}}{{/each}}");
  }

  function writeIteratorSeperatorIfNecessary(binding, traverseNode) {
    if (binding.token === templateKey.iteratorToken &&
      shouldSeparate(traverseNode.parent) &&
      isIteratorContainer(traverseNode.parent)) {
      //this is to handle the situation where an iterator is mixed into
      //the middle of an array but the value binding to the iterator doesn't exist
      //only output the separator if we actually created output with the iterator
      writeContent("{{#if " + binding.variable + "}},{{/if}}");
    }
  }

  function beforeValue(traverseNode, binding) {
    if (binding) writeOpenBinding(binding);
  }

  function afterValue(traverseNode, binding, separate) {
    if (binding) {
      writeCloseBinding(binding, separate);
      writeIteratorSeperatorIfNecessary(binding, traverseNode);
    }
    if (separate && !isIteratorContainer(traverseNode)) writeContent(",");
  }

  function writeSimpleValue(traverseNode, value, binding, separate) {
    beforeValue(traverseNode, binding);
    writeContent(JSON.stringify(value));
    afterValue(traverseNode, binding, separate);
  }

  function writeArrayValue(traverseNode, binding, separate) {
    traverseNode.before(function () {
      beforeValue(traverseNode, binding);
      writeContent("[");
    });

    traverseNode.after(function () {
      writeContent("]");
      afterValue(traverseNode, binding, separate);
    });
  }

  function writeObjectValue(traverseNode, binding, separate) {
    let metas = traverseNode.keys.map(templateKey.parse);
    let writeBraces = metas.length === 0 || metas.some(child => !!child.name);

    traverseNode.before(function () {
      beforeValue(traverseNode, binding);
      if (writeBraces) writeContent("{");
    });

    traverseNode.after(function () {
      if (writeBraces) writeContent(" }");
      afterValue(traverseNode, binding, separate);
    });
  }

  function isIteratorContainer(traverseNode) {
    if (!traverseNode.keys || traverseNode.keys.length !== 1) return false;
    let metas = traverseNode.keys.map(templateKey.parse);
    return metas.every(meta => meta.binding && meta.binding.token === templateKey.iteratorToken);
  }

  function shouldSeparate(traverseNode, meta, binding) {
    if (binding) {
      if (templateKey.sectionTokens.includes(binding.token)) return false;
      if (templateKey.iteratorToken === binding.token &&
        traverseNode.parent.keys.length === 2 &&
        traverseNode.parent.keys.includes("^" + binding.variable)) return false;
    }
    return traverseNode.parent &&
      traverseNode.parent.keys.indexOf(traverseNode.key) !== traverseNode.parent.keys.length - 1;
  }

  traverse(model).forEach(function (value) {
    let inArray = this.parent && types.isArray(this.parent.node);
    let meta = this.parent && !inArray && this.key && templateKey.parse(this.key);
    if (meta && meta.name) writeContent(JSON.stringify(meta.name) + ":");

    let binding = meta && meta.binding;
    let separate = shouldSeparate(this, meta, binding);

    if (value === null || simpleTypes.includes(typeof value)) return writeSimpleValue(this, value, binding, separate);

    if (types.isArray(value)) writeArrayValue(this, binding, separate);
    else writeObjectValue(this, binding, separate);
  });

  return buffer;
}

module.exports = exports = toHandlebars;
