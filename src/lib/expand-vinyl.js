var Vinyl = require("vinyl");
var through2 = require("through2");
var YAML = require("yamljs");
var expandYaml = require("./expand-yaml");

var expandVinyl = function() {
  return through2.obj(function(file, enc, cb) {
    var value = YAML.parse(file.contents.toString());
    var result = expandYaml(value);
    content = YAML.stringify(result, { depth: null });
    this.push(new Vinyl({ cwd: file.cwd, base: file.base, path: file.path, contents: new Buffer(content) }));
    cb(); //signal completion
  });
}

module.exports = exports = expandVinyl;
