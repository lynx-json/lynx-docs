var Vinyl = require("vinyl");
var through2 = require("through2");
var streamUtils = require("./stream-utils");
var exportYaml = require("../lib/export-yaml");
var YAML = require("yamljs");

function buildCommand(yargs) {
  return yargs
    .usage("$0 export [--input] [--output] [--format]")
    .option("input", {
      alias: "i",
      describe: "Input file(s) to expand as glob string, array of glob strings, or stream. [default: stdin]",
    })
    .option("output", {
      alias: "o",
      describe: "Output folder or stream. [default: stdout]",
    })
    .option("format", {
      alias: "f",
      describe: "The template destination format.",
      default: 'handlebars'
    })
    .example("$0 export -i **/*.yml -o ./out -f handlebars")
    .example("cat default.yml | $0 export")
    .help()
    .argv;
}

var exportVinylFile = function(format) {
  return through2.obj(function(file, enc, cb) {
    var value = YAML.parse(file.contents.toString());

    var buffer = "";
    exportYaml(format, value, function(data) {
      buffer += data;
    });
    if(buffer.length > 0) buffer += "\n";

    this.push(new Vinyl({ cwd: file.cwd, base: file.base, path: file.path, contents: new Buffer(buffer) }));
    cb(); //signal completion
  });
}


var exportCli = function(options) {
  var source = streamUtils.createSourceStream(options.input || process.stdin);
  var dest = streamUtils.createDestinationStream(options.output || process.stdout);

  source.pipe(exportVinylFile(options.format))
    .pipe(dest);
}

module.exports = { command: "export", describe: "Export YAML file to template", builder: buildCommand, handler: exportCli, vinyl: exportVinylFile }
