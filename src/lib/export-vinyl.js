var Vinyl = require("vinyl");
var through2 = require("through2");
var YAML = require("yamljs");
var expandYaml = require("./expand-yaml");
var finishYaml = require("./finish-yaml");
var exportYaml = require("./export-yaml");

var exportVinyl = function(format) {
  return through2.obj(function(file, enc, cb) {
    var value = YAML.parse(file.contents.toString());
    var result = finishYaml(expandYaml({ key: undefined, value: value }));

    var buffer = "";
    exportYaml(format, result, function(data) {
      buffer += data;
    });
    if (buffer.length > 0) buffer += "\n";

    this.push(new Vinyl({ cwd: file.cwd, base: file.base, path: file.path, contents: new Buffer(buffer) }));
    cb(); //signal completion
  });
}

module.exports = exports = exportVinyl;
