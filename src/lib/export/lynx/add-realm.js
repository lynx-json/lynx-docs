"use strict";
const traverse = require("traverse");
const exportLynx = require("./index");

function addRealm(realm) {
  return function (template) {
    return traverse(template).forEach(function (jsValue) {
      if (exportLynx.isLynxValue(jsValue) && !exportLynx.getLynxParentNode(this)) {
        this.update(Object.assign({ realm: realm }, jsValue));
      }
    });
  };
}

exports.addRealm = addRealm;
