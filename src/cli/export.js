"use strict";

var lynxDocs = require("../index");
var streamUtils = require("./stream-utils");
var exportVinyl = require("../lib/export-vinyl");
var path = require("path");

function buildCommand(yargs) {
  return yargs
    .usage("$0 export [--input] [--output] [--format] [--config]")
    .option("input", {
      alias: "i",
      describe: "Input file(s) to export as glob string, array of glob strings, or stdin.",
      default: "stdin"
    })
    .option("output", {
      alias: "o",
      describe: "Output folder or stdout.",
      default: "stdout"
    })
    .option("format", {
      alias: "f",
      describe: "The format to export to.",
      default: 'lynx'
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
    require(config)(lynxDocs);
  }

  var input = options.input === "stdin" ? process.stdin : options.input;
  var source = streamUtils.createSourceStream(input);

  var output = options.output === "stdout" ? process.stdout : options.output;
  var dest = streamUtils.createDestinationStream(output);

  source.pipe(exportVinyl(options))
    .pipe(dest);
};

module.exports = {
  command: "export",
  describe: "Exports Lynx YAML templates to another format",
  builder: buildCommand,
  handler: exportCli
};
