"use strict";

var exportToHandleBars = require("./export-yaml-to-hb");
var templateData = require("../template-data");
var handlebars = require("handlebars");

function bindData(contents, data) {
  var template = handlebars.compile(contents, { noEscape: true }); //TODO: Review adding { compat: true } as option
  return template(data);
}

function exportLynx(kvp, cb, options) {

  var buffer = "";
  exportToHandleBars(kvp, function(data) {
    buffer += data;
  }, options);
  if (buffer.length > 0) buffer += "\n";

  options.state = options.state || "default";

  var data;
  
  if ((typeof options.data) === "string") {
    data = templateData(options.data);
  } else {
    data = options.data;
  }
  
  cb(bindData(buffer, data));
}

module.exports = exports = exportLynx;
