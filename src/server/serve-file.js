"use strict";
const mime = require("mime");
const fs = require("fs");
const log = require("logatim");
const path = require("path");

mime.define({
  "application/lynx+json": ["lnx"],
  "application/lynx-spec+json": ["lnxs"]
});

function serveFile(options) {
  if (options.mime) mime.define(options.mime);

  return function (filename) {
    return function (req, res, next) {
      function onFileContents(err, contents) {
        if (err) {
          log.error(err);
          return next();
        }

        var headers = { "Content-Type": mime.getType(filename) };
        if (options.spec && options.spec.cache && path.extname(filename) === ".lnxs") {
          headers["Cache-Control"] = "public, max-age=31536000";
        }

        res.writeHead(200, headers);
        res.write(contents, "binary");
        res.end();
      }

      function onFileStat(err, stat) {
        if (err) {
          log.error(err);
          return next();
        }

        if (stat.isDirectory()) return next();
        fs.readFile(filename, "binary", onFileContents);
      }

      fs.stat(filename, onFileStat);
    };
  };
}

module.exports = exports = serveFile;
