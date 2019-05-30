"use strict";
const Vinyl = require("vinyl");
const streamFromArray = require("stream-from-array");
exports.toHandlebars = require("./to-handlebars");
exports.variantsToLynx = require("./variants-to-lynx");

const formats = {
  handlebars: exports.toHandlebars.all,
  lynx: exports.variantsToLynx.all
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

exports.exportRealms = exportRealms;
exports.processTemplate = require("./process-template");
exports.templateData = require("./template-data");
exports.lynx = require("./lynx");
