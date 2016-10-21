#!/usr/bin/env node

var yargs = require("yargs");

yargs
  .command(require("./process"))
  .command(require("./expand"))
  .command(require("./finish"))
  .command(require("./export"))
  .usage("$0 [command] [<args>]")
  .version(require("../../package.json").version)
  .help()
  .demand(1)
  .example("$0 process -i **/*.yml -o ./out")
  .argv;
