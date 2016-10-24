var streamUtils = require("./stream-utils");
var exportVinyl = require("../lib/export-vinyl");
var path = require("path");

function buildCommand(yargs) {
  return yargs
    .usage("$0 export [--input] [--output] [--format] [--config]")
    .option("input", {
      alias: "i",
      describe: "Input file(s) to export as glob string, array of glob strings, or stream.",
      default: "stdin"
    })
    .option("output", {
      alias: "o",
      describe: "Output folder or stream.",
      default: "stdout"
    })
    .option("format", {
      alias: "f",
      describe: "The format to export to.",
      default: 'handlebars'
    })
    .option("config", {
      alias: "c",
      describe: "External configuration file to import."
    })
    .example("$0 export -i **/*.yml -o ./out -f handlebars")
    .example("cat default.yml | $0 export")
    .help()
    .argv;
}

var exportCli = function(options) {
  if (options.config) {
    var config = path.resolve(process.cwd(), options.config);
    require(config);
  }
  
  var input = options.input === "stdin" ? process.stdin : options.input;
  var source = streamUtils.createSourceStream(input);
  
  var output = options.output === "stdout" ? process.stdout : options.stdout;
  var dest = streamUtils.createDestinationStream(output);

  source.pipe(exportVinyl(options.format))
    .pipe(dest);
}

module.exports = { command: "export", describe: "Exports Lynx YAML templates to another format", builder: buildCommand, handler: exportCli }
