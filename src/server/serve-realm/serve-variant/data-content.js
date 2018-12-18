const processData = require('../../../lib/export/template-data');
const jsYaml = require('js-yaml');

function serveData(options) {
  return function (data, realm) {
    return function (req, res, next) {
      let dataOptions = Object.assign({}, options, { realm: realm });
      let processed = processData(data, dataOptions);

      let headers = {
        'Content-Type': 'text/x-yaml',
        'Cache-Control': 'no-cache'
      };

      res.writeHead(200, headers);
      res.end(jsYaml.safeDump(processed, { skipInvalid: true, lineWidth: Number.MAX_SAFE_INTEGER }));
    };
  };
}

module.exports = exports = serveData;
