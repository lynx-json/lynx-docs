"use strict";

const traverse = require("traverse");
const keyMetadata = require("./key-metadata");
const util = require("util");
const simpleTypes = ["number", "boolean", "string"];

function toHandlebars(model) {
  let buffer = "";

  function writeContent(content) {
    buffer += content;
  }

  function writeOpenBinding(binding) {
    if (keyMetadata.simpleTokens.includes(binding.token)) {
      let quote = binding.token === "<" ? "\"" : "";
      writeContent("{{#if " + binding.variable + "}}" + quote + "{{" + binding.variable + "}}" + quote + "{{else}}");
    } else if (keyMetadata.sectionTokens.includes(binding.token)) {
      writeContent("{{" + binding.token + binding.variable + "}}");
    } else if (keyMetadata.iteratorToken === binding.token) {
      writeContent("{{#each " + binding.variable + "}}");
    }
    //ignore partials if they exist when writing to handlebars
  }

  function writeCloseBinding(binding) {
    if (keyMetadata.simpleTokens.includes(binding.token)) writeContent("{{/if}}");
    else if (keyMetadata.sectionTokens.includes(binding.token)) writeContent("{{/" + binding.variable + "}}");
    else if (keyMetadata.iteratorToken === binding.token) writeContent("{{#unless @last}},{{/unless}}{{/each}}");
    //ignore partials if they exist when writing to handlebars
  }

  function writeSimpleValue(value, binding, separate) {
    if (binding) writeOpenBinding(binding);
    writeContent(JSON.stringify(value));
    if (binding) writeCloseBinding(binding);
    if (separate) writeContent(",");
  }

  function writeArrayValue(node, separate) {
    node.before(function () {
      writeContent("[");
    });

    node.after(function () {
      writeContent("]");
      if (separate) writeContent(",");
    });
  }

  function writeObjectValue(node, binding, separate) {
    let metas = node.keys.map(key => keyMetadata.parse(key));
    let hasKeys = metas.every(child => !!child.name);

    node.before(function () {
      if (binding) writeOpenBinding(binding);
      if (hasKeys) writeContent("{");
    });

    node.after(function () {
      if (hasKeys) writeContent(" }");
      if (binding) writeCloseBinding(binding);
      if (separate) writeContent(",");
    });
  }

  traverse(model).forEach(function (value) {
    let meta = this.parent && !Array.isArray(this.parent.node) && this.key && keyMetadata.parse(this.key);
    if (meta && meta.name) writeContent(JSON.stringify(meta.name) + ":");

    let separate = this.parent && this.parent.keys.indexOf(this.key) !== this.parent.keys.length - 1;
    let binding = meta && meta.binding;
    if (binding && !meta.name) separate = false;

    if (value === null || simpleTypes.includes(typeof value)) return writeSimpleValue(value, binding, separate);

    if (Array.isArray(value)) writeArrayValue(this, separate);
    else writeObjectValue(this, binding, separate);

  });

  return buffer;
}

module.exports = exports = toHandlebars;
