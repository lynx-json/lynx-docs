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

function accumulateLynxChildren(jsValue) {
  if (!types.isObject(jsValue)) return [];
  return Object.keys(jsValue)
    .map(keyMetadata.parse)
    .reduce((acc, meta) => {
      if (meta.name === specKey) return acc;
      if (meta.name) acc.push({ "name": meta.name });
      else if (meta.binding && keyMetadata.sectionTokens.includes(meta.binding.token)) {
        acc = acc.concat(accumulateLynxChildren(jsValue[meta.source]));
      }
      return acc;
    }, []);
}

function calculateLynxChildren(template) {
  return traverse(template).forEach(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue)) {
      let children = accumulateLynxChildren(jsValue.value || jsValue);
      if (children.length > 0) {
        jsValue.spec.children = deDupeChildren(children);
        this.update(jsValue);
      }
    }
  });
}

module.exports = exports = calculateLynxChildren;
