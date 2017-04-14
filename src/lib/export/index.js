"use strict";

var Vinyl = require("vinyl");
var streamFromArray = require("stream-from-array");

var formats = {
  handlebars: require("./to-handlebars").all,
  lynx: require("./variants-to-lynx").all
};

function exportRealms(realms, options) {
  if (!options.format) throw new Error("options.format is required");

  var files = [];

  function createFile(path, content) {
    files.push(new Vinyl({ path: path, contents: new Buffer(content) }));
  }

  exportFormat(realms, createFile, options);

  return streamFromArray.obj(files);
}

function exportFormat(realms, createFile, options) {
  if (!formats[options.format]) throw new Error("Unsupported format: " + options.format);
  formats[options.format](realms, createFile, options);
}

exportRealms.add = function addExportFn(format, exportFn) {
  //signature of export function. exportFn(realms, createFile, options)
  formats[format] = exportFn;
};

module.exports = exports = exportRealms;
