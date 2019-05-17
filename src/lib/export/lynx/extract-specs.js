"use strict";

const traverse = require("traverse");
const md5 = require("md5");
const url = require("url");
const exportLynx = require("./index");
const types = require("../../../types");
const log = require("logatim");

function extractSpecs(template, options, createFile) {
  if (!types.isObject(options) || !types.isObject(options.spec) || !types.isString(options.spec.url) || !types.isString(options.spec.dir)) throw Error("Options must have a spec.url and spec.dir value in order to correctly write spec content and spec urls.");

  if (!types.isFunction(createFile)) throw Error("createFile must be a function");

  return traverse(template).map(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue)) {
      if (exportLynx.containsDynamicContent(jsValue.spec)) return;

      let specContent = JSON.stringify(jsValue.spec);
      if (("size" in options.spec) && (specContent.length < options.spec.size)) {
        log.debug(`Skipping extraction for the following spec because its size is less than ${options.spec.size} bytes:`);
        log.debug(specContent);
        return;
      }

      let specName = md5(specContent) + ".lnxs";
      jsValue.spec = url.resolve(options.spec.url, specName);

      createFile(specName, specContent);
      this.update(jsValue);
    }
  });
}

exports.extractSpecs = extractSpecs;
