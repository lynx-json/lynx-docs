"use strict";

var Vinyl = require("vinyl");
var streamFromArray = require("stream-from-array");

var formats = {
  handlebars: { fn: require("./templates-to-handlebars"), ext: ".handlebars" },
  lynx: { fn: require("./variants-to-lynx").all, ext: ".lnx" }
};

function exportRealms(realms, options) {
  if(!options.format) throw new Error("options.format is required");

  var files = [];

  function createFile(path, content) {
    files.push(new Vinyl({ path: path, contents: new Buffer(content) }));
  }

  exportFormat(realms, createFile, options);

  return streamFromArray.obj(files);
}

function exportFormat(realms, createFile, options) {
  if(!formats[options.format]) throw new Error("Unsupported format: " + options.format);
  formats[options.format].fn(realms, createFile, options);
}

exportRealms.add = function addExportFn(format, exportFn, ext) {
  formats[format] = { fn: exportFn, ext: ext };
};

exportRealms.getExtension = function getExtensionForFormat(format) {
  return formats[format] && formats[format].ext;
};

module.exports = exports = exportRealms;
