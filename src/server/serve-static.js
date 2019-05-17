"use strict";
const url = require("url");
const path = require("path");
const fs = require("fs");

function createServeStatic(options) {
  const serveFile = require("./serve-file")(options);
  return function serveStatic(req, res, next) {
    if (req.filename) return serveFile(req.filename)(req, res, next);

    var relativePathToFile = "." + url.parse(req.url).pathname;
    if (!path.extname(relativePathToFile)) return next();

    var pathsToFile = options.root.map(function (root) {
      return path.resolve(root, relativePathToFile);
    });

    var pathToFile = pathsToFile.find(function (p) {
      return fs.existsSync(p);
    });

    if (!pathToFile) return next();
    serveFile(pathToFile)(req, res, next);
  };
}

module.exports = exports = createServeStatic;
