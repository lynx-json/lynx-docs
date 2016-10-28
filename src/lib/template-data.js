var fs = require("fs");
var path = require("path");
var parseYaml = require("./parse-yaml");

function readDataFile(dataFile) {
  var parsedPath = path.parse(dataFile);
  
  function getContents() {
    return fs.readFileSync(dataFile);
  }
  
  switch (parsedPath.ext) {
    case ".yml":
      return parseYaml(getContents()) || {};
    case ".json":
      return JSON.parse(getContents().toString());
    case ".js":
      function resolveDataFile(otherDataFile) {
        otherDataFile = path.resolve(path.dirname(dataFile), otherDataFile);
        return readDataFile(otherDataFile);
      }
    
      delete require.cache[require.resolve(dataFile)];
    
      var generator = require(dataFile);
      return generator(resolveDataFile);
    default:
      throw new Error("Unrecognized example data file format: ", parsedPath.ext)
  }
}

module.exports = exports = readDataFile
