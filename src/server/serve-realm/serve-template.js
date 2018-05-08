const fs = require("fs");
const templateToHandlebars = require("../../lib/export/to-handlebars").one;

function createFile(path, content) {
  if (fs.existsSync(path)) return;
  fs.writeFileSync(path, content);
}

function serveTemplate(options) {
  return function (template, realm) {
    return function (req, res, next) {
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Cache-control", "no-cache");

      var templateOptions = Object.assign({}, options, { realm: realm });

      res.write(templateToHandlebars(template.path, templateOptions, createFile));
      res.end();
    };
  };
}

module.exports = exports = serveTemplate;
