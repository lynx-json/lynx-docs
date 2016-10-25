var fs = require("fs");
var path = require("path");
var readDataFile = require("./read-data-file");

function getDefaultTemplate(states) {
  if (states.length === 1) return states[0];
  return states.find(function(item) { return item.combinedName === item.template; })
}

function getStateDataPath(templatePath) {
  var name = path.parse(templatePath).name;
  var relative = ".." + path.sep + name + ".data" + path.sep;
  return path.resolve(templatePath, relative);
}

function getStates(templatePath) {
  var stateDataPath = getStateDataPath(templatePath);
  var parsedTemplate = path.parse(templatePath);
  var states = fs.readdirSync(stateDataPath).map(function(dataFile) {
    var parsedDataFile = path.parse(dataFile);
    var stateName = parsedDataFile.name;
    var combinedName = stateName === "default" ? parsedTemplate.name :
      parsedTemplate.name + "-" + parsedDataFile.name;

    return {
      name: stateName,
      template: parsedTemplate.name,
      combinedName: combinedName,
      dataFile: path.join(templatePath, dataFile)
    }
  });

  return {
    list: states,
    default: getDefaultTemplate(states)
  };
}

function resolveStateData(templatePath, state) {
  var stateDataPath = getStateDataPath(templatePath)
  var statePath = path.resolve(stateDataPath, state);
  var data;
  try {
    data = readDataFile(statePath);
  } catch (err) {
    data = {};
  }
  return data;
}

module.exports = exports = { getStates: getStates, resolveStateData: resolveStateData }
