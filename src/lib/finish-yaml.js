var util = require("util");

function finishing(kvp) {
  finishing.functions.forEach(function (fn) {
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

finishing.functions = [];
finishing.add = function(finishingFn) {
  finishing.functions.push(finishingFn);
}

module.exports = exports = finishing;
