var fs = require("fs");
var path = require("path");
var util = require("util");
var parse = require("../lib/parse-yaml");
var expand = require("../lib/expand-yaml");
var finish = require("../lib/finish-yaml");
var exportYaml = require("../lib/export-yaml");
var parseYaml = require("../lib/parse-yaml");
var YAML = require("yamljs");

function onContent(src, dest, format) {
  return function (err, content) {
    if (err) {
      console.log("Error reading input file:", src, err);
      throw err;
    }

    var yaml = parse(content);

    var kvp = {
      value: yaml,
      global: {
        src: src
      }
    };

    kvp = finish( expand( kvp ) );

    var hb = [];
    exportYaml(format, kvp, function(data) {
      hb.push(data);
    });

    fs.writeFile(dest, hb.join(""), function (err) {
      console.log("Error writing output file:", dest, err);
      throw err;
    });
  };
}

module.exports = exports = function exportYaml(inFile, outFile, outFormat, importModule) {
  if (importModule) require(importModule);
  inFile = path.resolve(inFile);
  outFile = path.resolve(outFile);
  fs.readFile(inFile, onContent(inFile, outFile, outFormat));
};
