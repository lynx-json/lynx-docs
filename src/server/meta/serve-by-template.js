const path = require("path");
const url = require("url");

module.exports = exports = function createServeByTemplateHandler(options) {
  return function (req, res, next) {
    if (req.pathname.indexOf("/template") !== 0) return next();
    if (!req.query || !req.query.q) return next();
    
    var template = path.resolve(req.query.q);
    var realm = req.realms.find(r => r.templates.some(t => template === t));
    
    if (!realm) return next();
    
    var headers = {
      "Content-Type": "text/plain",
      "Location": realm.url,
      "Cache-control": "no-cache"
    };
    res.writeHead(301, headers);
    res.end("Redirecting to realm " + realm.url);
  };
};
