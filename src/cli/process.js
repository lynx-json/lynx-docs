var streamUtils = require("./stream-utils");
var expand = require("./expand");
var finish = require("./finish");

function buildCommand(yargs) {
  return yargs
    .usage("$0 process [--input] [--output]")
    .option("input", {
      alias: "i",
      describe: "input file(s) to finish as glob string or array of glob strings. Omit to read from stdin.",
    })
    .option("output", {
      alias: "o",
      describe: "Output folder. Omit to write to stdout.",
    })
    .example("$0 process -i **/*.yml -o ./out")
    .example("cat default.yml | $0 process")
    .help()
    .argv;
}

var processCli = function(options) {
  var source = streamUtils.createSourceStream(options.input || process.stdin);
  var dest = streamUtils.createDestinationStream(options.output || process.stdout);

  source.pipe(expand.vinyl())
    .pipe(finish.vinyl())
    .pipe(dest);
}

module.exports = { command: "process", describe: "Applies expanding and finishing to YAML file", builder: buildCommand, handler: processCli }
