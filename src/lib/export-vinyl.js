var Vinyl = require("vinyl");
var through2 = require("through2");
var exportYaml = require("./export-yaml");
var YAML = require("yamljs");

var exportVinyl = function(format) {
  return through2.obj(function(file, enc, cb) {
    var value = YAML.parse(file.contents.toString());

    var buffer = "";
    exportYaml(format, value, function(data) {
      buffer += data;
    });
    if (buffer.length > 0) buffer += "\n";

    this.push(new Vinyl({ cwd: file.cwd, base: file.base, path: file.path, contents: new Buffer(buffer) }));
    cb(); //signal completion
  });
}

module.exports = exports = exportVinyl;
