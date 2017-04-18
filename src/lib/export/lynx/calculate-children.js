const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");
const keyMetadata = require("../../json-templates/key-metadata");
const specKey = "spec";

function deDupeChildren(children) {
  return children.reduce((acc, child) => {
    if (!acc.some(item => item.name === child.name)) acc.push(child);
    return acc;
  }, []);
}

function calculateLynxChildren(template) {
  return traverse(template).forEach(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue)) {
      let children = exportLynx.accumulateLynxChildren(jsValue);
      if (children.length > 0) {
        jsValue.spec.children = deDupeChildren(children.map(item => { return { "name": item.meta.name }; }));
        this.update(jsValue);
      }
    }
  });
}

module.exports = exports = calculateLynxChildren;
