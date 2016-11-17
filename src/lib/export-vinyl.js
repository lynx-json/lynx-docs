"use strict";

var Vinyl = require("vinyl");
var through2 = require("through2");
var parseYaml = require("./parse-yaml");
var expandYaml = require("./expand-yaml");
var finishYaml = require("./finish-yaml");
var exportYaml = require("./export-yaml");
var util = require("util");
var getMetadata = require("./metadata-yaml");

function getKVP(yaml) {
  if (!util.isObject(yaml)) return { key: undefined, value: yaml };

  var props = Object.getOwnPropertyNames(yaml);

  if (props.length === 1 && getMetadata(props[0]).key === undefined) {
    return {
      key: props[0],
      value: yaml[props[0]]
    };
  }

  return { key: undefined, value: yaml };
}

function exportBuffer(buffer, cb, options) {
  var yaml = parseYaml(buffer);
  var kvp = getKVP(yaml);

  if (options.log) {
    console.log("### Options");
    console.log(JSON.stringify(options), "\n");
  }

  var expandedYaml = expandYaml(kvp, options);

  if (options.log) {
    console.log("### Expanded");
    console.log(JSON.stringify(expandedYaml), "\n");
  }

  var finishedYaml = finishYaml(expandedYaml, options);

  if (options.log) {
    console.log("### Finished");
    console.log(JSON.stringify(finishedYaml), "\n");
  }

  exportYaml(options.format, finishedYaml, cb, options);
}

var exportVinyl = function(options) {
  return through2.obj(function(file, enc, cb) {

    var buffer = "";
    function onData(data) {
      buffer += data;
    }

    exportBuffer(file.contents, onData, options);
    options.origin = file;
    if (buffer.length > 0) buffer += "\n";
    var ext = exportYaml.getExtension(options.format);
    if(ext) file.extname = ext;

    this.push(new Vinyl({ cwd: file.cwd, base: file.base, path: file.path, contents: new Buffer(buffer) }));
    cb(); //signal completion
  });
};

exportVinyl.exportBuffer = exportBuffer;

module.exports = exports = exportVinyl;
