#!/usr/bin/env node

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
  .argv;
