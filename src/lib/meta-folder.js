"use strict";

const fs = require("fs");
const path = require("path");
const templatePattern = /^.*\.yml$/;

function createState(name, template, dataFile) {
  return {
    name: name,
    template: template,
    dataFile: dataFile
  };
}

module.exports = exports = folderPath => {
  var folderContents = fs.readdirSync(folderPath);
  
  function getStates() {
    var states = [];
    
    var templateStates = folderContents.filter(n => templatePattern.test(n))
      .map(n => createState(path.parse(n).name, path.join(folderPath, n)));
    
    templateStates.forEach(t => {
      var dataFolderPath = path.join(folderPath, t.name + ".data");
      if (fs.existsSync(dataFolderPath)) {
        let contents = fs.readdirSync(dataFolderPath);
        states = states.concat(contents.map(n => {
          var stateName = path.parse(n).name;
          if (stateName === "default") stateName = t.name;
          else if (t.name !== "default") stateName = t.name + "-" + stateName;
          
          return createState(stateName, t.template, path.join(dataFolderPath, n));
        }));
      } else {
        states.push(t);
      }
    });
      
    return states;
  }
  
  function getDefaultState(states) {
    if (states.length === 1) return states[0];
    return states.find(s => s.name === "default");
  }
  
  var meta = {
    states: {}
  };
  
  var states = getStates();
  meta.states.list = states;
  
  var defaultState = getDefaultState(states);
  if (defaultState) meta.states.default = defaultState;
  
  return meta;
};
