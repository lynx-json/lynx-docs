var util = require("util");

function finishing(kvp) {
  finishingFunctions.forEach(function (fn) {
    var result = fn(kvp);
    if (result) kvp = result;
  });

  if (!util.isObject(kvp.value)) return kvp;
  
  Object.getOwnPropertyNames(kvp.value).forEach(function (childKey) {
    var childValue = kvp.value[childKey];
    var childKvp = { key: childKey, value: childValue };
    var result = finishing(childKvp);
    
    if (result) {
      kvp.value[result.key] = result.value;
      
      if (result.key !== childKey) {
        delete kvp.value[childKey];
      }
    }
  });
  
  return kvp;
}

var finishingFunctions = [];

finishing.add = function(finishingFn) {
  finishingFunctions.push(finishingFn);
};

finishing.clear = function() {
  finishingFunctions = [];
};

module.exports = exports = finishing;
