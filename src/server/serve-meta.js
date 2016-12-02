const path = require("path");
const exportYaml = require("../lib/export-vinyl");
const url = require("url");

module.exports = exports = function createMetaHandler(options) {
  return function (req, res, next) {
    if (!req.pathname === "/docs/meta/realm/") return next();
    
    var realm = req.realms.find(r => r.realm === req.query.realm);
    // var metaRealm = req.realms.find(r => url.parse(r.realm).pathname === url.parse(req.url).pathname);
    
    if (realm) {
      res.setHeader("Content-Type", "application/lynx+json");
      res.setHeader("Cache-control", "no-cache");
    
      exportYaml.handler({
        format: "lynx",
        template: path.join(__dirname, "meta/default.lynx.yml"),
        output: res,
        data: realm,
        realm: {
          realm: "http://lynx-json.org/docs/meta/realm/",
          folder: path.join(__dirname, "meta")
        }
      });
    } else next();
  };
};
