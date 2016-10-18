var formats = {
  handlebars: require("./export-yaml-to-hb")
};

function exportYaml(format, kvp, callback) {
  if (!formats[format]) throw new Error("Unsupported format: " + format);
  formats[format](kvp, callback);
}

exportYaml.add = function addExportFn(format, exportFn) {
  formats[format] = exportFn;
};

module.exports = exports = exportYaml;
