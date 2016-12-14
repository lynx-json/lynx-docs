"use strict";

const fs = require("fs");
const util = require("util");
const parseYaml = require("../parse-yaml");
const expandYaml = require("../expand-yaml");
const finishYaml = require("../finish-yaml");
const getMetadata = require("../metadata-yaml");
const flattenSpecForKvp = require("./flatten-yaml");
const extractSpec = require("./extract-spec");

function getKVP(yaml) {
  if(!util.isObject(yaml)) return { key: undefined, value: yaml };

  var props = Object.getOwnPropertyNames(yaml);

  if(props.length === 1 && getMetadata(props[0]).key === undefined) {
    return {
      key: props[0],
      value: yaml[props[0]]
    };
  }

  return { key: undefined, value: yaml };
}

function processTemplate(templatePath, options, createFile) {
  var buffer = fs.readFileSync(templatePath);
  var yaml = parseYaml(buffer);
  var kvp = getKVP(yaml);

  if(options.log) {
    console.log("### Template Options");
    console.log(JSON.stringify(options), "\n");
  }

  var expandedYaml = expandYaml(kvp, options);

  if(options.log) {
    console.log("### Expanded");
    console.log(JSON.stringify(expandedYaml), "\n");
  }

  var finishedYaml = finishYaml(expandedYaml, options);

  if(options.log) {
    console.log("### Finished");
    console.log(JSON.stringify(finishedYaml), "\n");
  }

  if(options.flatten) {
    finishedYaml = flattenSpecForKvp(finishedYaml);
  }

  if(options.log) {
    console.log("### Flattened");
    console.log(JSON.stringify(finishedYaml), "\n");
  }

  if(options.spec) {
    finishedYaml = extractSpec(finishedYaml, options, createFile);
  }

  if(options.log) {
    console.log("### Spec extracted");
    console.log(JSON.stringify(finishedYaml), "\n");
  }

  return finishedYaml;
}

module.exports = exports = processTemplate;
