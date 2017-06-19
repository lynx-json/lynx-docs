const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");
const templateKey = require("../../json-templates/template-key");

function condenseValue(jsValue, updateValue) {
  if (Object.keys(jsValue).includes("value")) {
    if (types.isObject(jsValue.value)) {
      var dynamicValue = Object.keys(jsValue.value)
        .map(templateKey.parse)
        .every(meta => meta.binding && templateKey.sectionTokens.includes(meta.binding.token));
      if (dynamicValue) return; //if the value is dynamic, then we need to keep the value key

      Object.assign(jsValue, jsValue.value);
      delete jsValue.value;
    } else {
      updateValue(jsValue.value); //condense to non object value (string, array, etc.)
    }
  }
}

function moveChildrenSpecToParent(jsValue) {
  let specChildren = jsValue.spec && jsValue.spec.children;
  let accumulated = exportLynx.accumulateLynxChildren(jsValue);

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
