const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");
const keyMetadata = require("../../json-templates/key-metadata");
const specKey = "spec";

function condenseValue(lynxValue) {
  if (Object.keys(lynxValue).includes("value")) {
    Object.assign(lynxValue, lynxValue.value);
  }
  delete lynxValue.value;
}

function moveChildrenSpecToParent(jsValue) {
  let children = jsValue.spec.children;
  var accumulated = exportLynx.accumulateLynxChildren(jsValue);

  accumulated.forEach(child => {
    moveChildrenSpecToParent(child.value);
    let childSpec = children.find(item => item.name === child.meta.name);
    if (childSpec) {
      Object.assign(childSpec, child.value.spec);
      delete child.value.spec;
    }
  });
  accumulated.forEach(child => condenseValue(child.value));
  if (accumulated.length > 0) condenseValue(jsValue);
}

function rollupSpecs(template) {
  return traverse(template).map(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue)) {
      moveChildrenSpecToParent(jsValue);
      this.update(jsValue);
    }
  });
}

module.exports = exports = rollupSpecs;
