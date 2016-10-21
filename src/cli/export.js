var streamUtils = require("./stream-utils");
var exportVinyl = require("../lib/export-vinyl");

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

var exportCli = function(options) {
  var source = streamUtils.createSourceStream(options.input || process.stdin);
  var dest = streamUtils.createDestinationStream(options.output || process.stdout);

  source.pipe(exportVinyl(options.format))
    .pipe(dest);
}

module.exports = { command: "export", describe: "Export YAML file to template", builder: buildCommand, handler: exportCli }
