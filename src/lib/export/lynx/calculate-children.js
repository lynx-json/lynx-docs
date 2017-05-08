const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");
const specKey = "spec";

function getLynxChildren(lynxJsValue) {
  let children = exportLynx.accumulateLynxChildren(lynxJsValue);
  let sectionWithChildren = children.find(item => item.children && item.children.length > 0);

  //merge the named children with children from sections that have children
  let unique = children.reduce((acc, child) => {
    if (child.section && sectionWithChildren) {
      acc = acc.concat(sectionWithChildren.children); //add section children
      sectionWithChildren = null; //only add section children once
    } else if (!child.section) {
      acc.push(child);
    }
    return acc;
  }, []);

  return unique.map(item => { return { name: item.meta.name }; });
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
