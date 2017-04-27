#!/usr/bin/env node

const yargs = require("yargs");
const log = require("logatim");

yargs
  .command(require("./export"))
  .command(require("./start"))
  .usage("$0 [command] [<args>]")
  .version(require("../../package.json").version)
  .help()
  .demand(1)
  .example("$0 export -r src -o views")
  .example("$0 start -r src")
  .fail(function (msg, err, yargs) {
    log.red.bold.error(err || msg);
    log.yellow.error("\nUse 'lynx-docs --help' for usage information");
    process.exit(1);
  })
  .argv;
