var streamUtils = require("./stream-utils");
var finishVinyl = require("../lib/finish-vinyl");

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

var finishCli = function(options) {
  var source = streamUtils.createSourceStream(options.input || process.stdin);
  var dest = streamUtils.createDestinationStream(options.output || process.stdout);

  source.pipe(finishVinyl())
    .pipe(dest);
}

module.exports = { command: "finish", describe: "Applies finishing to expanded YAML file", builder: buildCommand, handler: finishCli }
