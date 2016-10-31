"use strict";

var Vinyl = require("vinyl");
var through2 = require("through2");
var parseYaml = require("./parse-yaml");
var expandYaml = require("./expand-yaml");
var finishYaml = require("./finish-yaml");
var exportYaml = require("./export-yaml");

for (var p in finishYaml) { //TODO: Probably want to configure finishing differently than this.
  if (!finishYaml.hasOwnProperty(p) || p === "add" || p === "clear" || typeof finishYaml[p] !== "function") continue;
  finishYaml.add(finishYaml[p]);
}

var exportVinyl = function(options) {
  return through2.obj(function(file, enc, cb) {
    var value = parseYaml(file.contents);
    var result = finishYaml(expandYaml({ key: undefined, value: value }));
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
