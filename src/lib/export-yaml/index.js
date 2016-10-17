var formats = {
  hb: require("./export-yaml-to-hb"),
  handlebars: hb
};

module.exports = exports = function exportYaml(format, kvp, callback) {
  if (!formats[format]) throw new Error("Unsupported format: " + format);
  formats[format](kvp, callback);
};
