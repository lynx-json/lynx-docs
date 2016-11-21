"use strict";

var formats = {
  handlebars: { fn: require("./export-yaml-to-hb"), ext: ".handlebars" },
  lynx: { fn: require("./export-yaml-to-lynx"), ext: ".lnx" }
};

function exportYaml(format, kvp, callback, options) {
  if (!formats[format]) throw new Error("Unsupported format: " + format);
  formats[format].fn(kvp, callback, options);
}

exportYaml.add = function addExportFn(format, exportFn, ext) {
  formats[format] = { fn: exportFn, ext: ext };
};

exportYaml.getExtension = function getExtensionForFormat(format) {
  return formats[format] && formats[format].ext;
};

module.exports = exports = exportYaml;
