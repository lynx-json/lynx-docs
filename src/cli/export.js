"use strict";

var lynxDocs = require("../index");
var path = require("path");
var util = require("util");
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

  if(options.config) {
    var config = path.resolve(process.cwd(), options.config);
    require(config)(lynxDocs);
  } else {
    require("../config")(lynxDocs);
  }

  var output = options.output === "stdout" ? process.stdout : options.output;
  var dest = streamUtils.createDestinationStream(output);

  if(!util.isArray(options.root)) options.root = [options.root];
  options.root = options.root.map(r => path.resolve(r));

  var realms = getRealms(options);
  exportLib(realms, options).pipe(dest);
};

function getRealms(options) {
  var realms = [];

  options.root.forEach(function (root) {
    realms = realms.concat(getRealmMetadata(root));
  });

  realms = realms.sort(function (a, b) {
    if(a.realm === b.realm) return 0;
    if(a.realm.indexOf(b.realm) === 0) return 1;
    if(b.realm.indexOf(a.realm) === 0) return -1;
  });

  return realms;
}

exports.handler = exportCli;
exports.builder = buildCommand;
exports.describe = "Exports Lynx YAML templates to another format";
exports.command = "export";
