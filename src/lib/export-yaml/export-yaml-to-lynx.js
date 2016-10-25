var exportToHandleBars = require("./export-yaml-to-hb");
var states = require("../states");
var handlebars = require("handlebars");

function bindData(contents, data) {
  var template = handlebars.compile(contents); //TODO: Review adding { compat: true } as option
  return template(data);
};

function exportLynx(kvp, cb, options) {

  var buffer = "";
  exportToHandleBars(kvp, function(data) {
    buffer += data;
  });
  if (buffer.length > 0) buffer += "\n";

  options.state = options.state || "default";

  var data = states.resolveStateData(options.origin.path, options.state);
  //TODO: Need to add urls onto the data object
  //data.urls = getUrlDataFromSomewhere();

  cb(bindData(buffer, data));
}

module.exports = exports = exportLynx;