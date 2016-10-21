var streamUtils = require("./stream-utils");
var expand = require("./expand");
var finish = require("./finish");
var ex = require("./export");

function buildCommand(yargs) {
  return yargs
    .usage("$0 process [--input] [--output] [--format]")
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
      describe: "The template destination format. ",
      default: 'handlebars'
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
    .pipe(ex.vinyl(options.format))
    .pipe(dest);
}

module.exports = { command: "process", describe: "Applies expanding and finishing to YAML file", builder: buildCommand, handler: processCli }
