var streamUtils = require("./stream-utils");
var expandVinyl = require("../lib/expand-vinyl");

function buildCommand(yargs) {
  return yargs
    .usage("$0 expand [--input] [--output]")
    .option("input", {
      alias: "i",
      describe: "Input file(s) to expand as glob string, array of glob strings, or stream. [default: stdin]",
    })
    .option("output", {
      alias: "o",
      describe: "Output folder or stream. [default: stdout]",
    })
    .example("$0 expand -i **/*.yml -o ./out")
    .example("cat default.yml | $0 expand")
    .help()
    .argv;
}

var expandCli = function(options) {
  var source = streamUtils.createSourceStream(options.input || process.stdin);
  var dest = streamUtils.createDestinationStream(options.output || process.stdout);

  source.pipe(expandVinyl())
    .pipe(dest);
}

module.exports = { command: "expand", describe: "Expands input YAML file", builder: buildCommand, handler: expandCli }
