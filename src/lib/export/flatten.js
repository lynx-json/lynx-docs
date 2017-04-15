const traverse = require("traverse");
const lynxNodeKeys = ["spec", "value"];

function getLynxParent(node) {

  var candidate = node.parent;
  while (candidate) {
    let hasLynxKeys = candidate.keys && lynxNodeKeys.every(lnk => candidate.keys.includes(lnk));
    if (hasLynxKeys && !candidate.path.includes("spec")) return candidate;
    candidate = candidate.parent;
  }
}

function flatten(template) {

  console.log(template);

  var leafs = traverse(template).reduce(function (acc, value) {
    if (this.isLeaf && !this.path.includes("spec")) {
      acc.push(this);
    }
    return acc;
  }, []);

  console.log("lynx parents", leafs.map(getLynxParent));
  return template;
}

module.exports = exports = flatten;
