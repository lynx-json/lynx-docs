"use strict";

const traverse = require("traverse");
const md5 = require("md5");
const path = require("path");
const url = require("url");
const exportLynx = require("./index");

function extractSpecs(template, options, createFile) {
  if (!options || !options.spec || !options.spec.url || !options.spec.dir) throw Error("Options value must have a spec.url and spec.dir value in order to correctly write spec content and spec urls.");
  if (!createFile) throw Error("createFile is required");

  return traverse(template).map(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue)) {
      //stringify spec content.
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
