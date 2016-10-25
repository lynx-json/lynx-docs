var formats = {
  handlebars: require("./export-yaml-to-hb"),
  lynx: require("./export-yaml-to-lynx")
};

function exportYaml(format, kvp, callback, options) {
  if (!formats[format]) throw new Error("Unsupported format: " + format);
  formats[format](kvp, callback, options);
}

exportYaml.add = function addExportFn(format, exportFn) {
  formats[format] = exportFn;
};

module.exports = exports = exportYaml;
