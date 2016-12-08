"use strict";

const commonCli = require("./common");
const streamUtils = require("./stream-utils");
const exportLib = require("../lib/export");

const getRealmMetadata = require("../lib/metadata-realm");

function buildCommand(yargs) {
  return yargs
    .usage("$0 export [--root OR root..] [--output] [--format] [--config]")
    .option("root", {
      alias: "r",
      describe: "Root folder(s) for the web site",
      default: "."
    })
    .option("output", {
      alias: "o",
      describe: "Output folder or stream",
      default: "stdout"
    })
    .option("format", {
      alias: "f",
      describe: "The format to export to",
      default: "handlebars"
    })
    .option("config", {
      alias: "c",
      describe: "External configuration file to require"
    })
    .example("$0 export -r src -o views -f handlebars")
    .example("$0 export -r src")
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
