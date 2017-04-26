const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");
const specKey = "spec";

function condenseValue(lynxValue, updateValue) {
  if (Object.keys(lynxValue).includes("value")) {
    if (types.isObject(lynxValue.value)) {
      Object.assign(lynxValue, lynxValue.value);
      delete lynxValue.value;
    } else {
      updateValue(lynxValue.value); //condense to non object value (string, array, etc.)
    }
  }
}

function moveChildrenSpecToParent(jsValue) {
  let specChildren = jsValue.spec && jsValue.spec.children;
  let accumulated = exportLynx.accumulateLynxChildren(jsValue)
    .reduce((acc, item) => {
      if (!item.section) acc.push(item);
      else {
        acc = acc.concat(item.children);
      }
      return acc;
    }, []);

  accumulated.forEach(child => {
    moveChildrenSpecToParent(child.value);
    let childSpec = specChildren && specChildren.find(item => item.name === child.meta.name);
    if (childSpec) {
      Object.assign(childSpec, child.value.spec);
      delete child.value.spec;
    }
  });
  accumulated.forEach(child => condenseValue(child.value, child.updateValue));
  if (accumulated.length > 0) condenseValue(jsValue);
}

function flattenLynx(template) {
  return traverse(template).map(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue)) {
      moveChildrenSpecToParent(jsValue);
      this.update(jsValue);
    }
  });
}

module.exports = exports = flattenLynx;
