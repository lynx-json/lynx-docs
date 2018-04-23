const fs = require("fs");
const path = require("path");
const jsonTemplates = require("../json-templates");
const parseYaml = require("../parse-yaml");

function readDataFile(dataFile) {
  function getContents() {
    return fs.readFileSync(dataFile);
  }

  function resolveDataFile(otherDataFile) {
    otherDataFile = path.resolve(path.dirname(dataFile), otherDataFile);
    return readDataFile(otherDataFile);
  }

  try {
    let parsedPath = path.parse(dataFile);
    let data = {};

    if (parsedPath.ext === ".yml") data = parseYaml(getContents()) || {};
    if (parsedPath.ext === ".json") data = JSON.parse(getContents().toString());
    if (parsedPath.ext === ".js") {
      delete require.cache[require.resolve(dataFile)];

      let generator = require(dataFile);
      data = generator(resolveDataFile);
    }

    data = jsonTemplates.expandTokens(data);
    return jsonTemplates.partials.expand(data, jsonTemplates.partials.resolve, dataFile);
  } catch (err) {
    err.message = `Error reading data file '${dataFile}'\r\n${err.message}`;
    throw err;
  }

  throw new Error("Unrecognized data file format: ", parsedPath.ext);
}

module.exports = exports = readDataFile;
