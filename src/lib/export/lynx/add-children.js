const traverse = require("traverse");
const types = require("../../../types");
const exportLynx = require("./index");

function calculateSpecChildren(spec, value) {
  if (!types.isObject(value)) return null;
  let children = [];
  Object.keys(value).forEach(key => {
    var result = exportLynx.isLynxNodeOrResultsInLynxNode(value[key]);
    if (result) children.push({ "name": key });
  });
  return children.length > 0 ? children : null;
}

function addChildrenToTemplate(template) {
  return traverse(template).forEach(function (value) {
    if (this.key === "spec") { //spec node
      var lynxValue = this.parent.keys.includes("value") ? this.parent.node.value : this.parent.node;
      var children = calculateSpecChildren(this, lynxValue);
      if (children) value.children = children;
      this.update(value);
    }
  });
}

module.exports = exports = addChildrenToTemplate;
