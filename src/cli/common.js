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
  normalizeLinting(options);
  normalizeRoot(options);
  normalizeSpecHandling(options);

  log.blue("Options\n=======").debug();
  log.debug(JSON.stringify(options, null, 2));
}

function applyDefaults(options) {
  if (options.root === undefined) options.root = ".";
  if (options.log === undefined) options.log = "error";
  if (options.flatten === undefined) options.flatten = false;
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
      log.red("Unable to process run control file '" + rcFile + "'. File must be a valid yaml file").error();
    }
  }
}

function applyRunControlToOptions(rc, options) {
  function setIfNotPresent(key, value) { //arguments already set win over run control values
    if (value === null) return;
    if (options[key] === undefined) options[key] = value;
  }
  let rcOptions = {};
  ["root", "log", "spec", "flatten"].forEach(key => {
    if (rc[key] !== undefined) rcOptions[key] = rc[key];
  });

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

function normalizeLinting(options) {
  if (options.linting === undefined || options.linting === true) options.linting = { json: true, lynx: true };
  if (options.linting === false) options.linting = { json: false, lynx: false };
}

function normalizeLogging(options) {
  if (!types.isString(options.log)) options.log = "error";
  log.setLevel(options.log);
}

function normalizeSpecHandling(options) {
  if (!types.isObject(options.spec)) {
    if (options.spec === "false" || options.spec === false) options.spec = undefined;
    if (options.spec) options.spec = {}; //overwrite existing non object value with empty object
  }
  if (options.spec === undefined) return;

  options.flatten = true; //infer flattening when extracting specs

  if (!options.spec.dir) options.spec.dir = ".";
  if (!options.spec.url) options.spec.url = "/";
}

function normalizeRoot(options) {
  var roots = options._.slice(1); //look for variadic arguments as roots
  if (roots.length === 0) {
    roots = types.isArray(options.root) ? options.root : [options.root];
  }

  options.root = roots;
}

module.exports = exports = handleOptions;
