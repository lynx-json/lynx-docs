const fs = require("fs");
const path = require("path");
const parseYaml = require("../parse-yaml");

function readDataFile(dataFile) {
  var parsedPath = path.parse(dataFile);

  function getContents() {
    return fs.readFileSync(dataFile);
  }

  function resolveDataFile(otherDataFile) {
    otherDataFile = path.resolve(path.dirname(dataFile), otherDataFile);
    return readDataFile(otherDataFile);
  }

  if (parsedPath.ext === ".yml") return parseYaml(getContents()) || {};
  if (parsedPath.ext === ".json") return JSON.parse(getContents().toString());
  if (parsedPath.ext === ".js") {
    delete require.cache[require.resolve(dataFile)];

    var generator = require(dataFile);
    return generator(resolveDataFile);
  }
  throw new Error("Unrecognized example data file format: ", parsedPath.ext);
}

module.exports = exports = readDataFile;
