var fs = require("fs");
var path = require("path");
var parseYaml = require("../parse-yaml");

var extensions = [".js", ".yml", ".json"];

function readDataFile(dataFile) {
  var ext = extensions.find(function(value){
    return fs.existsSync(dataFile + value);
  });

  if(!ext) throw new Error("Datafile not found");

  var contents = fs.readFileSync(dataFile + ext);
  if (ext === ".yml") {
    return parseYaml(contents) || {}; //protect against empty data file
  } else if (ext === ".json") {
    return JSON.parse(contents.toString());
  } else if (ext === ".js") {
    function resolveDataFile(otherDataFile) {
      otherDataFile = path.resolve(path.dirname(dataFile), otherDataFile);
      return readDataFile(otherDataFile);
    }

    delete require.cache[require.resolve(dataFile)];

    var generator = require(dataFile);
    return generator(resolveDataFile);
  } else {
    throw new Error("Unrecognized example data file");
  }
}

module.exports = exports = readDataFile;
