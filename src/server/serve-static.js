const url = require("url");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const log = require("logatim");

mime.define({
  "application/lynx+json": ["lnx"],
  "application/lynx-spec+json": ["lnxs"]
});

function createServeStatic(options) {
  function serveFile(req, res, next) {
    function onFileContents(err, contents) {
      if (err) {
        log.error(err);
        return next();
      }

      var headers = { "Content-Type": mime.lookup(req.filename) };
      if (options.spec.cache && path.extname(req.filename) === ".lnxs") {
        headers["Cache-Control"] = "max-age=31536000";
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
      fs.readFile(req.filename, "binary", onFileContents);
    }

    fs.stat(req.filename, onFileStat);
  }

  return function serveStatic(req, res, next) {
    if (req.filename) return serveFile(req, res, next);

    var relativePathToFile = "." + url.parse(req.url).pathname;
    if (!path.extname(relativePathToFile)) return next();

    var pathsToFile = options.root.map(function (root) {
      return path.resolve(root, relativePathToFile);
    });

    var pathToFile = pathsToFile.find(function (p) {
      return fs.existsSync(p);
    });

    if (!pathToFile) return next();
    req.filename = pathToFile;
    serveFile(req, res, next);
  };
}

module.exports = exports = createServeStatic;
