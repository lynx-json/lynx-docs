"use strict";

var commonCli = require("./common");
var streamUtils = require("./stream-utils");
var exportLib = require("../lib/export");

const getRealmMetadata = require("../lib/metadata-realm");

function buildCommand(yargs) {
  return yargs
    .usage("$0 export [--root] [--output] [--format] [--config]")
    .option("root", {
      alias: "r",
      describe: "Root(s) for the web site.",
      default: "."
    })
    .option("output", {
      alias: "o",
      describe: "Output folder.",
      default: "stdout"
    })
    .option("format", {
      alias: "f",
      describe: "The format to export to.",
      default: "handlebars"
    })
    .option("config", {
      alias: "c",
      describe: "Configuration to use."
    })
    .example("$0 export -r ./src -o ./out -f handlebars")
    .example("$0 export -r ./src")
    .help()
    .argv;
}

var exportCli = function (options) {

  commonCli(options);

  var output = options.output === "stdout" ? process.stdout : options.output;
  var dest = streamUtils.createDestinationStream(output);

  var realms = getRealmMetadata(options.root);
  exportLib(realms, options).pipe(dest);
};

exports.handler = exportCli;
exports.builder = buildCommand;
exports.describe = "Exports Lynx YAML templates to another format";
exports.command = "export";
