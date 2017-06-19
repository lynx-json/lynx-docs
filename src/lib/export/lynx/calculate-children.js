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

function calculateLynxChildren(template) {
  return traverse(template).forEach(function (jsValue) {
    if (exportLynx.isLynxValue(jsValue) && !types.isArray(exportLynx.getValuePortionOfLynxValue(jsValue))) {
      let children = getLynxChildren(jsValue);
      if (children.length > 0) {
        jsValue.spec.children = children;
        this.update(jsValue);
      }
    }
  });
}

module.exports = exports = calculateLynxChildren;
