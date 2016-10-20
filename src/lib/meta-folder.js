const fs = require("fs");
const path = require("path");
const templatePattern = /^.*\.yml$/;

module.exports = exports = name => {
  var folderContents = fs.readdirSync(name);
  
  function getStates() {
    return folderContents.filter(n => templatePattern.test(n)).map(n => path.parse(n).name);
  }
  
  function getDefaultState(states) {
    if (states.length === 1) return states[0];
    return states.find(s => s === "default");
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
