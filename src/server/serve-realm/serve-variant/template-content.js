const fs = require('fs');
const templateToHandlebars = require('../../../lib/export/to-handlebars').one;

function createFile(path, content) {
  if (fs.existsSync(path)) return;
  fs.writeFileSync(path, content);
}

function serveTemplate(options) {
  return function (template, realm) {
    return function (req, res, next) {
      let templateOptions = Object.assign({}, options, { realm: realm });
      let content = templateToHandlebars(template, templateOptions, createFile);

      let headers = {
        'Content-Type': 'text/x-handlebars-template',
        'Cache-Control': 'no-cache'
      };

      res.writeHead(200, headers);
      res.end(content);
    };
  };
}

module.exports = exports = serveTemplate;
