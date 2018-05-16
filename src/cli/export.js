"use strict";

const commonCli = require("./common");
const streamUtils = require("./stream-utils");
const exportLib = require("../lib/export");

const getRealmMetadata = require("../lib/metadata-realm");

function buildCommand(yargs) {
  return yargs
    .epilogue("For detailed cli documentation refer to https://github.com/lynx-json/lynx-docs/wiki/Command-Line-Parameters")
    .usage("$0 export [--root OR root..] [--output] [--format] [--config] [--log]")
    .option("root", {
      alias: "r",
      describe: "Root folder(s) for the web site. [default '.']"
    })
    .option("output", {
      alias: "o",
      describe: "Output folder or stream. [default 'stdout']"
    })
    .option("format", {
      alias: "f",
      describe: "The format to export to. [default 'handlebars']"
    })
    .option("log", {
      alias: "l",
      describe: "Set console logging level (error|warn|info|debug|trace). [default 'error']"
    })
    .option("spec.dir", {
      describe: "The directory to write files representing the spec object(s) in the template that can be extracted"
    })
    .option("spec.url", {
      describe: "Relative URL path to spec files. This value will be used to calculate the url that will replace the spec object(s) in the template that can be extracted."
    })
    .example("$0 export -r src -o views -f handlebars")
    .example("$0 export -r src")
    .help()
    .argv;
}

var exportCli = function (options) {

  commonCli(options);

  if (options.output === "stdout") options.output = process.stdout;
  var dest = streamUtils.createDestinationStream(options);

  var realms = getRealmMetadata(options.root);
  exportLib(realms, options).pipe(dest);
};

exports.handler = exportCli;
exports.builder = buildCommand;
exports.describe = "Exports Lynx YAML templates to another format";
exports.command = "export";
