"use strict";

var Vinyl = require("vinyl");
var through2 = require("through2");
var parseYaml = require("./parse-yaml");
var expandYaml = require("./expand-yaml");
var finishYaml = require("./finish-yaml");
var exportYaml = require("./export-yaml");

var exportVinyl = function(options) {
  return through2.obj(function(file, enc, cb) {
    var value = parseYaml(file.contents);
    var expandedYaml = expandYaml({ key: undefined, value: value }, options);
    var result = finishYaml(expandedYaml, options);
    options.origin = file;

    var buffer = "";
    exportYaml(options.format, result, function(data) {
      buffer += data;
    }, options);
    if (buffer.length > 0) buffer += "\n";

    this.push(new Vinyl({ cwd: file.cwd, base: file.base, path: file.path, contents: new Buffer(buffer) }));
    cb(); //signal completion
  });
};

module.exports = exports = exportVinyl;
