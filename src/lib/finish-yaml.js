var util = require("util");

function finishing(value, key) {
  finishing.functions.forEach(function (fn) {
    fn(value, key);
  });

  if (!util.isObject(value)) return;
  Object.getOwnPropertyNames(value).forEach(function (childKey) {
    finishing(value[childKey], childKey);
  });

}

finishing.functions = [];
finishing.add = function(finishingFn) {
  finishing.functions.push(finishingFn);
}

module.exports = exports = finishing;
