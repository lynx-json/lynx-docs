const traverse = require("traverse");
const keyMetadata = require("../json-templates/key-metadata");
const lynxNodeKeys = ["spec", "value"];

function isLynxNode(lynx) {
  if (!lynx) return false
  if (Object.prototype.toString.call(lynx) !== "[object Object]") return false;
  return lynxNodeKeys.every(key => Object.keys(lynx).includes(key));
}

function calculateSpecName(node) {
  let context = node;
  while (context) {
    let meta = keyMetadata.parse(context.key);
    if (meta.name) return meta.name;
    context = context.parent;
  }
  return "";
}

function canAddChildToParent(childNode, parentNode) {
  let context = childNode;
  while (context) {
    let meta = keyMetadata.parse(context.key);
    if (meta.binding && keyMetadata.sectionTokens.includes(meta.binding.token)) return false;
    if (context === parentNode) {
      return !Array.isArray(context.node.value[""] || context.node.value);
    }
    context = context.parent;
  }
  return false;
}

function addSpecToParent(childNode, parentNode) {
  var parent = parentNode.node;
  var child = childNode.node;

  if (!parent.spec.children) parent.spec.children = [];
  parent.spec.children.push(child.spec);
  child = child.value;
  childNode.update(child);
  parentNode.update(parent);
}

function walkLynxAncestory(leaf) {
  let context = leaf;
  let lynxNode;
  while (context) {
    let pair = context.node;
    if (isLynxNode(pair)) {
      if (!pair.spec.name) pair.spec.name = calculateSpecName(context);
      if (canAddChildToParent(lynxNode, context)) {
        addSpecToParent(lynxNode, context);
      }
      lynxNode = context;
    }
    context = context.parent;
  }
}

function flatten(template) {

  return traverse(template).forEach(function (value) {
    if (this.isLeaf && !this.path.includes("spec")) {
      walkLynxAncestory(this);
    }
  });
}

module.exports = exports = flatten;
