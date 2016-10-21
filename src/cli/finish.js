var Vinyl = require("vinyl");
var through2 = require("through2");
var YAML = require("yamljs");
var streamUtils = require("./stream-utils");
var finishYaml = require("../lib/finish-yaml");

function buildCommand(yargs) {
  return yargs
    .usage("$0 finish [--input] [--output]")
    .option("input", {
      alias: "i",
      describe: "Input file(s) to expand as glob string, array of glob strings, or stream. [default: stdin]",
    })
    .option("output", {
      alias: "o",
      describe: "Output folder or stream. [default: stdout]",
    })
    .example("$0 finish -i **/*.yml -o ./out")
    .example("cat default.yml | $0 expand | lynx-docs finish")
    .help()
    .argv;
}

var expandVinylFile = function() {
  return through2.obj(function(file, enc, cb) {
    var value = YAML.parse(file.contents.toString());
    var result = finishYaml(value);
    content = YAML.stringify(result, { depth: null });
    this.push(new Vinyl({ cwd: file.cwd, base: file.base, path: file.path, contents: new Buffer(content) }));
    cb(); //signal completion
  });
}

var finishCli = function(options) {
  var source = streamUtils.createSourceStream(options.input || process.stdin);
  var dest = streamUtils.createDestinationStream(options.output || process.stdout);

  source.pipe(expandVinylFile())
    .pipe(dest);
}

module.exports = { command: "finish", describe: "Applies finishing to expanded YAML file", builder: buildCommand, handler: finishCli, vinyl: expandVinylFile }
