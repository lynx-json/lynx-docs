"use strict";

var fs = require("fs");
var util = require("util");
var parseYaml = require("../parse-yaml");
var expandYaml = require("../expand-yaml");
var finishYaml = require("../finish-yaml");
var getMetadata = require("../metadata-yaml");

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

function expandAndFinishTemplate(templatePath, options) {
  var buffer = fs.readFileSync(templatePath);
  var yaml = parseYaml(buffer);
  var kvp = getKVP(yaml);

  if(options.log) {
    console.log("### Options");
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

  return finishedYaml;
}

module.exports = exports = expandAndFinishTemplate;
