var yargs = require("yargs");

yargs
  .command(require("./expand"))
  .command(require("./finish"))
  .command(require("./process"))
  .usage("$0 [command] [<args>]")
  .version(require("../../package.json").version)
  .help()
  .argv;
