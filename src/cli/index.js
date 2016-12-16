#!/usr/bin/env node

/*jshint expr:true */
const yargs = require("yargs");

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
    console.error(err || msg);
    console.log("\nUse 'lynx-docs --help' for usage information");
    process.exit(1);
  })
  .argv;
