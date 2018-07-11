const fs = require("fs");
const path = require("path");
const jsonTemplates = require("../json-templates");
const parseYaml = require("../parse-yaml");
const types = require("../../types");

function processDataOrFile(dataOrFile, options) {
  function getContents() {
    return fs.readFileSync(dataOrFile);
  }

  function resolveDataFile(otherDataFile) {
    otherDataFile = path.resolve(path.dirname(dataOrFile), otherDataFile);
    return processDataOrFile(otherDataFile, options);
  }

  function calculateResolveParitalStartPath(dataOrFile, options) {
    if (types.isString(dataOrFile)) return dataOrFile;
    if (options && options.realm && options.realm.folder) return options.realm.folder;
    return null;
  }

  try {
    if (!dataOrFile) return dataOrFile;

    let resolveParitalStartPath = calculateResolveParitalStartPath(dataOrFile, options);
    if (!types.isString(dataOrFile)) return jsonTemplates.process(dataOrFile, resolveParitalStartPath, options);

    let parsedPath = path.parse(dataOrFile);
    let data = {};

    if (parsedPath.ext === ".yml") data = parseYaml(getContents()) || {};
    if (parsedPath.ext === ".json") data = JSON.parse(getContents().toString());
    if (parsedPath.ext === ".js") {
      delete require.cache[require.resolve(dataOrFile)];

      let generator = require(dataOrFile);
      data = generator(resolveDataFile, options);
    }

    return jsonTemplates.process(data, resolveParitalStartPath, options);

  } catch (err) {
    err.message = `Error reading data file '${dataOrFile}'\r\n${err.message}`;
    throw err;
  }

  throw new Error("Unrecognized data file format: ", parsedPath.ext);
}

module.exports = exports = processDataOrFile;
