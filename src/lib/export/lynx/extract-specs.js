"use strict";

const traverse = require("traverse");
const md5 = require("md5");
const path = require("path");
const url = require("url");
const exportLynx = require("./index");
const types = require("../../../types");
const templateKey = require("../../json-templates/template-key");

function extractSpecs(template, options, createFile) {
  if (!types.isObject(options) || !types.isObject(options.spec) || !types.isString(options.spec.url) || !types.isString(options.spec.dir)) throw Error("Options must have a spec.url and spec.dir value in order to correctly write spec content and spec urls.");

  if (!types.isFunction(createFile)) throw Error("createFile must be a function");

  return traverse(template).map(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue)) {
      if (exportLynx.containsDynamicContent(jsValue.spec)) return;
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
