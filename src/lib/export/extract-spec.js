"use strict";

var md5 = require("md5");
var path = require("path");
var url = require("url");

function extractSpec(kvp, options, createFile) {

  //stringify spec content.
  var specContent = JSON.stringify(kvp.value.spec);
  var specName = md5(specContent) + ".lnxs";
  kvp.value.spec = url.resolve(options.spec.url, specName);

  var specPath = path.resolve(options.spec.dir, specName);
  createFile(specPath, specContent);

  return kvp;
}

module.exports = exports = extractSpec;
