"use strict";
const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");

function getLynxChildren(lynxJsValue) {
  let children = exportLynx.accumulateLynxChildren(lynxJsValue)
    .reduce((acc, child) => {
      if (acc.every(item => item.name !== child.meta.name)) acc.push({ name: child.meta.name });
      return acc;
    }, []);

  return children;
}

function filterDataProperties(jsValue, children) {
  if (!jsValue.spec.hints.some(hint => hint === "link" || hint === "content")) return children;
  return children.filter(child => child.name !== "data");
}

function calculateLynxChildren(template) {
  return traverse(template).forEach(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue) && !types.isArray(exportLynx.getValuePortionOfLynxValue(jsValue))) {
      let children = getLynxChildren(jsValue);
      if (children.length > 0) {
        children = filterDataProperties(jsValue, children);
        jsValue.spec.children = children;
        this.update(jsValue);
      }
    }
  });
}

exports.calculateLynxChildren = calculateLynxChildren;
