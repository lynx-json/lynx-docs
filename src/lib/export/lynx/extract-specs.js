"use strict";

const traverse = require("traverse");
const md5 = require("md5");
const path = require("path");
const url = require("url");
const exportLynx = require("./index");
const types = require("../../../types");
const templateKey = require("../../json-templates/template-key");

function containsDynamicContent(value) {
  let dynamicNodes = traverse(value).reduce(function (acc, jsValue) {
    let meta = this.key && templateKey.parse(this.key);
    if (meta && meta.binding) acc.push(jsValue);
    if (types.isString(jsValue) && jsValue.indexOf("{{") > -1) acc.push(jsValue);
    return acc;
  }, []);
  return dynamicNodes.length > 0;
}

function extractSpecs(template, options, createFile) {
  if (!types.isObject(options) || !types.isObject(options.spec) || !types.isString(options.spec.url) || !types.isString(options.spec.dir)) throw Error("Options must have a spec.url and spec.dir value in order to correctly write spec content and spec urls.");

  if (!types.isFunction(createFile)) throw Error("createFile must be a function");

  return traverse(template).map(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue)) {
      if (containsDynamicContent(jsValue.spec)) return;
      let specContent = JSON.stringify(jsValue.spec);
      let specName = md5(specContent) + ".lnxs";
      jsValue.spec = url.resolve(options.spec.url, specName);

      var specPath = path.resolve(options.spec.dir, specName);
      createFile(specPath, specContent);
      this.update(jsValue);
    }
  });
}

module.exports = exports = extractSpecs;
