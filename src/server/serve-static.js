const url = require("url");
const path = require("path");
const fs = require("fs");
const mime = require("mime");

function serveFile(req, res, next) {
  function onFileContents(err, contents) {
    if (err) {
      console.log(err);
      return next();
    }
    
    res.writeHead(200, { "Content-Type": mime.lookup(req.filename) });
    res.write(contents, "binary");
    res.end();
  }
  
  function onFileStat(err, stat) {
    if (err) {
      console.log(err);
      return next();
    }
    
    if (stat.isDirectory()) return next();
    fs.readFile(req.filename, "binary", onFileContents);
  }
  
  fs.stat(req.filename, onFileStat);
}

function createServeStatic(options) {
  return function serveStatic(req, res, next) {
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
