"use strict";

const commonCli = require("./common");

function buildCommand(yargs) {
  return yargs
    .epilogue("For detailed cli documentation refer to https://github.com/lynx-json/lynx-docs/wiki/Command-Line-Parameters")
    .usage("$0 start [--root OR root..] [--config] [--port] [--log]")
    .option("port", {
      alias: "p",
      describe: "Port to listen on. [default 3000]"
    })
    .option("root", {
      alias: "r",
      describe: "Root folder(s) for the web site. [default '.']"
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
