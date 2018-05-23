const fs = require("fs");
const variantToLynx = require("../../../lib/export/variants-to-lynx").one;

function createFile(path, content) {
  if (fs.existsSync(path)) return;
  fs.writeFileSync(path, content);
}

function serveTemplateVariant(options) {
  return function (variant, realm) {
    return function (req, res, next) {
      let variantOptions = Object.assign({}, options, { realm: realm, req: req, res: res });
      let content = variantToLynx(variant, variantOptions, createFile);
      let headers = {
        "Content-Type": "application/lynx+json",
        "Cache-Control": "no-cache"
      };

      res.writeHead(200, headers);
      res.end(content);
    };
  };
}

module.exports = exports = serveTemplateVariant;
