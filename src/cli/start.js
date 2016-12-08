"use strict";

const commonCli = require("./common");

function buildCommand(yargs) {
  return yargs
    .usage("$0 start [--port]")
    .option("port", {
      alias: "p",
      describe: "Port to listen on.",
      default: 3000
    })
    .option("root", {
      alias: "r",
      describe: "Root(s) for the web site.",
      default: "."
    })
    .option("config", {
      alias: "c",
      describe: "External configuration file to import."
    })
    .example("$0 start")
    .example("$0 start -p 8080")
    .help()
    .argv;
}

var startCli = function (options) {

  commonCli(options);

  // start the server
  require("../server/index.js")(options);
};

module.exports = {
  command: "start",
  describe: "Starts a web server to browse Lynx documents",
  builder: buildCommand,
  handler: startCli
};
