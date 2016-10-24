#!/usr/bin/env node

var yargs = require("yargs");

yargs
  .command(require("./expand"))
  .command(require("./finish"))
  .command(require("./process"))
  .usage("$0 [command] [<args>]")
  .version(require("../../package.json").version)
  .help()
  .demand(1)
  .example("$0 process --input \"**/*.yml\" --output \"./out\"")
  .argv;
