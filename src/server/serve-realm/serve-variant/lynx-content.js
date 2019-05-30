"use strict";
const fs = require('fs');
const path = require('path');
const variantToLynx = require('../../../lib/export/variants-to-lynx').one;

function serveTemplateVariant(options) {
  let specDir = path.join(process.cwd(), options.spec && options.spec.dir || ".");
  if (!fs.existsSync(specDir)) fs.mkdirSync(specDir);

  function createFile(name, content) {
    let filePath = path.join(specDir, name);
    if (fs.existsSync(filePath)) return;
    fs.writeFileSync(filePath, content);
  }

  return function (variant, realm) {
    return function (req, res, next) {
      let variantOptions = Object.assign({}, options, { realm: realm, req: req, res: res });
      let content = variantToLynx(variant, variantOptions, createFile);
      let headers = {
        'Content-Type': 'application/lynx+json',
        'Cache-Control': 'no-cache'
      };

      res.writeHead(200, headers);
      res.end(content);
    };
  };
}

module.exports = exports = serveTemplateVariant;
