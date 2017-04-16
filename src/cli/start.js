"use strict";

const commonCli = require("./common");

function buildCommand(yargs) {
  return yargs
    .usage("$0 start [--root OR root..] [--config] [--port]")
    .option("port", {
      alias: "p",
      describe: "Port to listen on",
      default: 3000
    })
    .option("root", {
      alias: "r",
      describe: "Root folder(s) for the web site",
      default: "."
    })
    .option("infer", {
      describe: "Infer section tokens when inverse is not supplied in template",
      default: false
    })
    .option("config", {
      alias: "c",
      describe: "External configuration file to require"
    })
    .example("$0 start -r src")
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
