var Vinyl = require("vinyl");
var through2 = require("through2");
var YAML = require("yamljs");
var streamUtils = require("./stream-utils");
var expandYaml = require("../lib/expand-yaml");

function buildCommand(yargs) {
  return yargs
    .usage("$0 expand [--input] [--output]")
    .option("input", {
      alias: "i",
      describe: "input file(s) to expand as glob string or array of glob strings. Omit to read from stdin.",
    })
    .option("output", {
      alias: "o",
      describe: "Output folder. Omit to write to stdout.",
    })
    .example("$0 expand -i **/*.yml -o ./out")
    .example("cat default.yml | $0 expand")
    .help()
    .argv;
}

var expandVinylFile = function() {
  return through2.obj(function(file, enc, cb) {
    var value = YAML.parse(file.contents.toString());
    var result = expandYaml(value);
    content = YAML.stringify(result, { depth: null });
    this.push(new Vinyl({ cwd: file.cwd, base: file.base, path: file.path, contents: new Buffer(content) }));
    cb(); //signal completion
  });
}

var expandCli = function(options) {
  var source = streamUtils.createSourceStream(options.input || process.stdin);
  var dest = streamUtils.createDestinationStream(options.output || process.stdout);

  source.pipe(expandVinylFile())
    .pipe(dest);
}

module.exports = { command: "expand", describe: "Expands input YAML file", builder: buildCommand, handler: expandCli, vinyl: expandVinylFile }
