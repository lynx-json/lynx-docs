const traverse = require("traverse");
const keyMetadata = require("../json-templates/key-metadata");
const lynxNodeKeys = ["spec", "value"];

function isLynxNode(node) {
  return node.keys && lynxNodeKeys.every(key => node.keys.includes(key));
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
    if (isLynxNode(context)) {
      let lynx = context.node;
      if (!lynx.spec) console.log(context);
      if (!lynx.spec.name) lynx.spec.name = calculateSpecName(context);
      if (lynxNode && !Array.isArray(lynx.value[""] || lynx.value)) {
        addSpecToParent(lynxNode, context);
      }
      lynxNode = context;
    }
    context = context.parent;
  }
}

function flatten(template) {

  traverse(template).forEach(function (value) {
    if (this.isLeaf && !this.path.includes("spec")) {
      walkLynxAncestory(this);
    }
  });

  return template;
}

module.exports = exports = flatten;
