const traverse = require("traverse");
const keyMetadata = require("../json-templates/key-metadata");
const lynxNodeKeys = ["spec", "value"];
const types = require("../../types");

module.exports = exports = flatten;

function resultsInLynxNode(node) {
  if (!types.isObject(node)) return false;
  //every key is section binding token or ""
  return Object.keys(node).every(key => {
    let meta = keyMetadata.parse(key);
    if (!(meta.name === "" || (meta.binding && keyMetadata.sectionTokens.includes(meta.binding.token)))) return false;
    return isLynxNodeOrResultsInLynxNode(node[key]);
  });
}

function isLynxNode(candidate) {
  if (!types.isObject(candidate)) return false;
  return lynxNodeKeys.every(key => Object.keys(candidate).includes(key));
}

function isLynxNodeOrResultsInLynxNode(candidate) {
  return isLynxNode(candidate) || resultsInLynxNode(candidate);
}

function calculateSpecChildren(spec, value) {
  if (!types.isObject(value)) return null;
  let children = [];
  Object.keys(value).forEach(key => {
    var result = isLynxNodeOrResultsInLynxNode(value[key]);
    if (result) children.push({ "name": key });
  });
  return children.length > 0 ? children : null;
}

function flatten(template) {
  return traverse(template).forEach(function (value) {
    if (this.key === "spec") { //spec node
      var lynxValue = this.parent.keys.includes("value") ? this.parent.node.value : this.parent.node;
      var children = calculateSpecChildren(this, lynxValue);
      if (children) value.children = children;
      this.update(value);
    }
  });
}
