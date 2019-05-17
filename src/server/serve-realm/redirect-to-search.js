"use strict";
const url = require("url");

module.exports = exports = function (options) {
  return function redirectToSearch(req, res, next) {
    var headers = {
      "Content-Type": "text/plain",
      "Location": "/meta/search/?q=" + url.parse(req.url).pathname,
      "Cache-Control": "no-cache"
    };
    res.writeHead(301, headers);
    res.end("Redirecting to search");
  };
};
