"use strict";

const fs = require("fs");
const path = require("path");
const types = require("../types");
const log = require("logatim");
const parseYaml = require("../lib/parse-yaml");

function handleOptions(options) {
  processRunControl(options); //fill in run control values for empty switches
  processEnvironmentVariables(options); //fill in env values for empty switches
  applyDefaults(options); //apply defaults for empty switches
  normalizeLogging(options);
  normalizeRoot(options);
  normalizeSpecHandling(options);
  normalizeInferInverseSections(options);

  log.blue.debug("Options\n=======");
  log.debug(JSON.stringify(options, null, 2));
}

function applyDefaults(options) {
  if (options.root === undefined) options.root = ".";
  if (options.log === undefined) options.log = "error";
  if (options.infer === undefined) options.infer = false;
  let command = options._[0];
  if (command.toLowerCase() === "start") {
    if (options.port === undefined) options.port = 3000;
  } else if (command.toLowerCase() === "export") {
    if (options.output === undefined) options.output = "stdout";
    if (options.format === undefined) options.format = "handlebars";
  }
}

function processEnvironmentVariables(options) {
  if (options.log === undefined && process.env.LOG_LEVEL) options.log = process.env.LOG_LEVEL;
}

function processRunControl(options) {
  let rcFile = path.resolve(process.cwd(), ".lynxdocsrc");
  if (fs.existsSync(rcFile)) {
    try {
      let runControl = parseYaml(fs.readFileSync(rcFile));
      applyRunControlToOptions(runControl, options);
    } catch (err) {
      log.red("Unable to process run control file '" + rcFile + "'. File must be a valid yaml file");
    }
  }
}

function applyRunControlToOptions(rc, options) {
  function setIfNotPresent(key, value) { //cli arguments win over run control values
    if (options[key] === undefined) options[key] = value;
  }
  let rcOptions = {};
  if (rc.inferInverseSections !== undefined) rcOptions.infer = rc.inferInverseSections;
  if (rc.root) rcOptions.root = rc.root;
  if (rc.log && rc.log.level) rcOptions.log = rc.log.level;
  if (rc.spec) rcOptions.spec = rc.spec;

  //based on command (start or export) apply run control settings if they exist
  let command = options._[0];
  let commandControl = rc[command];
  if (types.isObject(commandControl)) {
    Object.keys(commandControl).forEach(key => {
      rcOptions[key] = commandControl[key];
    });
  }

  Object.keys(rcOptions).forEach(key => setIfNotPresent(key, rcOptions[key]));
}

function normalizeInferInverseSections(options) {
  if (options.infer === undefined) options.infer = false;
}

function normalizeLogging(options) {
  if (!types.isString(options.log)) options.log = "error";
  log.setLevel(options.log);
}

function normalizeSpecHandling(options) {
  if (!options.spec) return;

  if (options.spec === true) options.spec = {};
  if (!options.spec.dir) options.spec.dir = ".";
  if (!options.spec.url) options.spec.url = "/";
}

function normalizeRoot(options) {
  var roots = options._.slice(1); //look for variadic arguments as roots
  if (roots.length === 0) {
    roots = types.isArray(options.root) ? options.root : [options.root];
  }

  options.root = options.r = roots;
}

module.exports = exports = handleOptions;
