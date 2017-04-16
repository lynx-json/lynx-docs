'use strict';

var typeCheck = {};

var types = 'Array Object String Date RegExp Function Boolean Number Null Undefined'.split(' ');

var type = function () {
  return Object.prototype.toString.call(this).slice(8, -1);
};

function createIsFn(self) {
  return function (elem) {
    return type.call(elem) === self;
  };
}

for (var i = types.length; i--;) {
  typeCheck['is' + types[i]] = createIsFn(types[i]);
}

module.exports = exports = typeCheck;
